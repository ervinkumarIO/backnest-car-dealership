# Bulk Image Deletion API - Frontend Integration Guide

## 🎯 **Overview**

This document provides comprehensive guidance for integrating the new **Bulk Image Deletion API** that solves the array reindexing issue when deleting multiple car images.

### **Problem Solved**
- ✅ **Array Reindexing Issue**: Eliminates 400 errors caused by sequential deletions
- ✅ **Atomic Operations**: All deletions succeed or fail together
- ✅ **Performance**: Single API call instead of multiple sequential calls
- ✅ **Reliability**: Handles duplicate indices and validation automatically

---

## 🔧 **New API Endpoint**

### **Bulk Delete Images by Indices**
```
DELETE /api/v1/cars/images/{chassisNo}/bulk-images
```

**Authentication**: Required (Admin/Master only)  
**Content-Type**: `application/json`

---

## 📝 **Request Format**

### **URL Parameters**
- `chassisNo` (string): The chassis number of the car

### **Request Body**
```json
{
  "indices": [0, 1, 2]
}
```

**Field Details:**
- `indices` (number[]): Array of image indices to delete (0-based)
- Must be non-empty array
- All indices must be non-negative integers
- Duplicate indices are automatically handled
- Indices are processed in optimal order to prevent reindexing issues

---

## 📊 **Response Format**

### **Success Response (200 OK)**
```json
{
  "message": "Images deleted successfully",
  "data": {
    "chassisNo": "DEF456",
    "deletedIndices": [2, 1, 0],
    "deletedImages": [
      "https://bucket.s3.amazonaws.com/car-images/image2.jpg",
      "https://bucket.s3.amazonaws.com/car-images/image1.jpg", 
      "https://bucket.s3.amazonaws.com/car-images/image0.jpg"
    ],
    "remainingImages": [
      "https://bucket.s3.amazonaws.com/car-images/image3.jpg"
    ],
    "imageCount": 1,
    "deletionResults": [
      {
        "index": 2,
        "url": "https://bucket.s3.amazonaws.com/car-images/image2.jpg",
        "s3Deleted": true,
        "attemptedFilenames": ["car-images/image2.jpg"]
      },
      {
        "index": 1,
        "url": "https://bucket.s3.amazonaws.com/car-images/image1.jpg",
        "s3Deleted": true,
        "attemptedFilenames": ["car-images/image1.jpg"]
      },
      {
        "index": 0,
        "url": "https://bucket.s3.amazonaws.com/car-images/image0.jpg",
        "s3Deleted": false,
        "attemptedFilenames": ["car-images/image0.jpg", "car-images/image0.jpg"],
        "error": "File not found in S3"
      }
    ],
    "summary": {
      "requested": 3,
      "processed": 3,
      "successful": 2,
      "failed": 1
    }
  }
}
```

### **Error Responses**

#### **400 Bad Request - Invalid Indices**
```json
{
  "statusCode": 400,
  "message": "Invalid indices: [5, 7]. Car has 3 images (valid indices: 0-2).",
  "error": "Bad Request"
}
```

#### **400 Bad Request - Car Not Found**
```json
{
  "statusCode": 400,
  "message": "Car not found",
  "error": "Bad Request"
}
```

#### **400 Bad Request - Empty Array**
```json
{
  "statusCode": 400,
  "message": "Indices array is required and must not be empty",
  "error": "Bad Request"
}
```

#### **400 Bad Request - Invalid Index Type**
```json
{
  "statusCode": 400,
  "message": "Invalid index: -1. All indices must be non-negative integers.",
  "error": "Bad Request"
}
```

---

## 💻 **Frontend Implementation**

### **1. Update Your Service Function**

Replace your existing sequential deletion with bulk deletion:

```typescript
// ❌ OLD WAY (Sequential - causes reindexing issues)
const deleteMultipleImages = async (chassisNo: string, indices: number[]) => {
  for (const index of indices) {
    await deleteImage(chassisNo, index); // This causes 400 errors
  }
};

// ✅ NEW WAY (Bulk - atomic operation)
const bulkDeleteImages = async (chassisNo: string, indices: number[]) => {
  const response = await axios.delete(
    `/api/v1/cars/images/${chassisNo}/bulk-images`,
    {
      data: { indices },
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
};
```

### **2. Update Your Component Logic**

```typescript
// Example: EditImagesDialog.tsx
const handleDelete = async () => {
  try {
    setDeleting(true);
    
    // Get selected indices
    const selectedIndices = selectedImages.map(img => img.index);
    
    // Call bulk deletion API
    const result = await bulkDeleteImages(carId, selectedIndices);
    
    console.log('✅ Bulk deletion successful:', result);
    
    // Update UI with remaining images
    setImages(result.data.remainingImages);
    setSelectedImages([]);
    
    // Show success message
    toast.success(`${result.data.summary.successful} images deleted successfully`);
    
    // Handle partial failures if needed
    if (result.data.summary.failed > 0) {
      toast.warning(`${result.data.summary.failed} images failed to delete from S3`);
    }
    
  } catch (error) {
    console.error('❌ Bulk deletion failed:', error);
    
    if (error.response?.status === 400) {
      toast.error(error.response.data.message || 'Invalid request');
    } else {
      toast.error('Failed to delete images. Please try again.');
    }
  } finally {
    setDeleting(false);
  }
};
```

### **3. Error Handling Examples**

```typescript
const handleBulkDeletion = async (chassisNo: string, indices: number[]) => {
  try {
    const result = await bulkDeleteImages(chassisNo, indices);
    
    // Check for partial success
    const { successful, failed, requested } = result.data.summary;
    
    if (successful === requested) {
      // All deletions successful
      showSuccess(`All ${successful} images deleted successfully`);
    } else if (successful > 0) {
      // Partial success
      showWarning(`${successful} of ${requested} images deleted. ${failed} failed.`);
    } else {
      // All failed
      showError(`Failed to delete any images`);
    }
    
    return result.data.remainingImages;
    
  } catch (error) {
    if (error.response?.status === 400) {
      const message = error.response.data.message;
      
      if (message.includes('out of range')) {
        showError('Some selected images no longer exist. Please refresh and try again.');
      } else if (message.includes('Car not found')) {
        showError('Car not found. Please check the chassis number.');
      } else {
        showError(message);
      }
    } else {
      showError('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
};
```

### **4. TypeScript Types**

```typescript
// API Types
interface BulkDeleteRequest {
  indices: number[];
}

interface BulkDeleteResponse {
  message: string;
  data: {
    chassisNo: string;
    deletedIndices: number[];
    deletedImages: string[];
    remainingImages: string[];
    imageCount: number;
    deletionResults: Array<{
      index: number;
      url: string;
      s3Deleted: boolean;
      attemptedFilenames?: string[];
      error?: string;
    }>;
    summary: {
      requested: number;
      processed: number;
      successful: number;
      failed: number;
    };
  };
}

// Service Function
const bulkDeleteImages = async (
  chassisNo: string, 
  indices: number[]
): Promise<BulkDeleteResponse> => {
  const response = await axios.delete<BulkDeleteResponse>(
    `/api/v1/cars/images/${chassisNo}/bulk-images`,
    { data: { indices } }
  );
  
  return response.data;
};
```

---

## 🧪 **Testing Guide**

### **1. Test Cases to Verify**

```typescript
// Test 1: Delete single image
await bulkDeleteImages('DEF456', [0]);

// Test 2: Delete multiple images
await bulkDeleteImages('DEF456', [0, 1, 2]);

// Test 3: Delete non-sequential indices
await bulkDeleteImages('DEF456', [0, 2, 4]);

// Test 4: Handle duplicate indices
await bulkDeleteImages('DEF456', [1, 1, 2]); // Should process [1, 2]

// Test 5: Error cases
await bulkDeleteImages('DEF456', []); // Should fail - empty array
await bulkDeleteImages('DEF456', [-1]); // Should fail - negative index
await bulkDeleteImages('DEF456', [99]); // Should fail - out of range
await bulkDeleteImages('INVALID', [0]); // Should fail - car not found
```

### **2. Manual Testing Steps**

1. **Setup**: Create a car with 4-5 images
2. **Test Bulk Selection**: Select multiple images (e.g., indices 0, 2, 3)
3. **Delete**: Click delete button
4. **Verify**: Check that selected images are removed and remaining images are correct
5. **Edge Cases**: Try deleting all images, single image, non-sequential indices

### **3. Expected Behaviors**

- ✅ **No 400 errors** from array reindexing
- ✅ **Atomic operation** - all selected images deleted together
- ✅ **UI updates correctly** with remaining images
- ✅ **Proper error messages** for invalid cases
- ✅ **Performance improvement** from single API call

---

## 🔄 **Migration Steps**

### **Step 1: Update Service Layer**
Replace sequential deletion functions with bulk deletion

### **Step 2: Update Components**
Modify image deletion handlers to use new API

### **Step 3: Update Error Handling**
Add proper error handling for new response format

### **Step 4: Test Thoroughly**
Verify all deletion scenarios work correctly

### **Step 5: Remove Old Code**
Clean up old sequential deletion code

---

## 🎯 **Benefits of New Approach**

| Aspect | Old Method | New Method |
|--------|------------|------------|
| **API Calls** | N calls (one per image) | 1 call (bulk operation) |
| **Reliability** | ❌ Fails on reindexing | ✅ Atomic operation |
| **Performance** | ❌ Slow (sequential) | ✅ Fast (parallel S3 deletion) |
| **Error Handling** | ❌ Complex partial states | ✅ Clear success/failure |
| **Database** | ❌ Multiple transactions | ✅ Single transaction |
| **User Experience** | ❌ Inconsistent results | ✅ Predictable outcomes |

---

## 🚨 **Important Notes**

1. **Backwards Compatibility**: The old single-image deletion endpoint (`DELETE /cars/images/{chassisNo}/{index}`) still works for single deletions

2. **S3 Resilience**: The API continues with database updates even if some S3 deletions fail (with proper logging)

3. **Index Validation**: All indices are validated before processing to prevent partial failures

4. **Duplicate Handling**: Duplicate indices in the request are automatically deduplicated

5. **Order Independence**: Indices can be provided in any order - they're processed optimally

---

## 📞 **Support**

If you encounter issues during implementation:

1. Check server logs for detailed error information
2. Verify your request format matches the specification
3. Test with single image deletion first
4. Ensure proper authentication headers

---

**Implementation Date**: September 11, 2025  
**API Version**: v1  
**Status**: Ready for Frontend Integration
