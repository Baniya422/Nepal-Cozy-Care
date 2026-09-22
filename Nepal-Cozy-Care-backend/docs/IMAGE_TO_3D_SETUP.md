# Image-to-3D AI Generation Service Guide

This document outlines how to configure external 3D generation services for Nepal Cozy Care.

---

## Current Status

- **Manual GLB Upload & 3D WebGL Preview**: **Fully active and ready for production**. Admins can upload any standard 3D `.glb` asset up to 25MB, visually inspect and adjust scale/orientation in real-time, and publish to the Room Designer.
- **Automated Image-to-3D Generation**: Ready for API key connection. Requires adding an API key from an image-to-3D provider (such as Meshy.ai or Tripo3D) into the backend `.env`.

---

## Setup Instructions

### 1. Obtain an API Key
Sign up for a 3D generation provider:
- **Meshy.ai**: [https://www.meshy.ai](https://www.meshy.ai) (Recommended for interior furniture and botanical assets)
- **Tripo3D**: [https://www.tripo3d.ai](https://www.tripo3d.ai)

### 2. Configure Backend Environment
Add the API key to your `Nepal-Cozy-Care-backend/.env` file:

```env
IMAGE_TO_3D_PROVIDER=meshy
MESHY_API_KEY=your_actual_meshy_api_key_here
```

### 3. Architecture Overview
1. **Upload Reference Image**: Admin uploads a single clear photograph of the plant, furniture piece, or decor item.
2. **Dispatch Generation**: Backend `ImageTo3DService` submits the task to the provider API.
3. **Draft Status Enforcement**: The generated `.glb` is downloaded to local storage and registered as a **`draft`** decoration.
4. **Admin Inspection**: Admins preview the 3D model in the interactive WebGL viewport, adjust scale and floor alignment, and manually click **"Publish"** when satisfied.

> [!NOTE]
> Single photos cannot guarantee 100% accurate hidden/back surfaces. Admins should always review the resulting mesh in the 3D preview before making it available in the public Room Designer.
