# Quickstart Guide: Asset System & Custom Components

**Feature**: 002-asset-system  
**Time Target**: < 5 minutes  
**Prerequisites**: Feature 001-scene-editor-mvp fully functional

## Scenario: Import 3D Spaceship & Add Rotation Script

This guide validates the end-to-end asset import and scripting workflow.

### Test Assets

Download test assets from:
- **spaceship.glb** - Simple low-poly spaceship model (~500KB, 2K triangles)
- [Placeholder URL - provide actual test asset]

### Validation Steps

#### Part 1: Upload 3D Model (2 minutes)

1. **Open Editor**
   - Navigate to `http://localhost:5173`
   - Verify Scene Editor loads with empty scene

2. **Open Assets Panel**
   - Click "Assets" tab at bottom of editor (or expand Assets panel)
   - Verify empty assets library message: "No assets yet. Upload your first asset!"

3. **Upload Model**
   - **Method A**: Drag `spaceship.glb` into assets panel drop zone
   - **Method B**: Click "Upload Asset" button, select file from browser
   - **Expected**: Upload progress bar appears
   - **Expected**: After 1-2 seconds, thumbnail appears in asset grid
   - **Verify**: Thumbnail shows preview of spaceship model
   - **Verify**: Asset name shows "spaceship" with .glb icon
   - **Verify**: Asset size shows ~500KB

4. **Create GameObject**
   - Click "Add GameObject" in toolbar
   - Verify "GameObject" appears in Hierarchy panel
   - Verify cube appears in viewport (default MeshRenderer)

5. **Add Model3D Component**
   - With GameObject selected, Inspector shows Transform and MeshRenderer
   - Click "Add Component" button
   - Select "Model3D" from dropdown
   - **Expected**: Model3D component appears in Inspector below MeshRenderer

6. **Select Model Asset**
   - In Model3D component, click "Asset" dropdown
   - **Expected**: Dropdown shows "spaceship.glb"
   - Select "spaceship.glb"
   - **Expected**: Loading indicator appears briefly
   - **Expected**: Spaceship model replaces cube in viewport
   - **Verify**: Model is visible and properly sized

7. **Adjust Scale**
   - In Model3D component, drag scale slider
   - Set scale to 2.0
   - **Expected**: Spaceship doubles in size in real-time
   - **Verify**: No lag, updates within 16ms

**Part 1 Success**: ✅ 3D model uploaded and rendered on GameObject

---

#### Part 2: Write Rotation Script (2 minutes)

8. **Add Code Component**
   - With same GameObject selected, click "Add Component"
   - Select "Code" from dropdown
   - **Expected**: Code component appears with Monaco Editor
   - **Expected**: Template code visible:
     ```javascript
     // Lifecycle hooks
     start() {
       // Called once when play mode starts
     }
     
     update(deltaTime) {
       // Called every frame during play mode
       // deltaTime = seconds since last frame
     }
     
     onDestroy() {
       // Called when GameObject is deleted
     }
     ```

9. **Write Rotation Code**
   - Click in `update()` function
   - Delete template comment
   - Type: `this.transform.rotation.y += deltaTime;`
   - **Expected**: Syntax highlighting works (keywords colored)
   - **Expected**: `this.transform` shows autocomplete suggestions
   - **Verify**: No syntax errors highlighted

10. **Enter Play Mode**
    - Click "Play" button in toolbar (or press Space)
    - **Expected**: Mode indicator changes to "Playing"
    - **Expected**: Spaceship starts rotating around Y axis
    - **Expected**: Rotation is smooth (no stuttering)
    - **Verify**: FPS counter shows 60 FPS (or close to 60)

11. **Check Console Output** (Optional)
    - Open Console panel (if not auto-open during play)
    - Add `console.log('Frame: ' + Date.now());` to `update()`
    - **Expected**: Console shows log messages every frame
    - **Expected**: No error messages

12. **Stop Play Mode**
    - Click "Stop" button in toolbar (or press Space)
    - **Expected**: Rotation stops
    - **Expected**: Spaceship returns to original orientation
    - **Expected**: Mode indicator changes to "Edit"

**Part 2 Success**: ✅ Code component executed and modified GameObject behavior

---

#### Part 3: Asset Library Management (1 minute)

13. **Save Code as Asset**
    - In Code component editor, click "Save as Asset" button
    - Enter name: "RotationScript"
    - Click "Save"
    - **Expected**: Toast notification: "Script saved to asset library"
    - Open Assets panel
    - **Verify**: "RotationScript.js" appears in asset grid

14. **Search Assets**
    - In Assets panel search bar, type "spaceship"
    - **Expected**: Only spaceship.glb visible, RotationScript hidden
    - Clear search
    - **Expected**: Both assets visible again

15. **Rename Asset**
    - Double-click "spaceship" asset
    - Type "PlayerShip"
    - Press Enter
    - **Verify**: Asset renamed to "PlayerShip.glb"
    - **Verify**: Model3D component dropdown shows updated name

16. **Test Asset Deletion Protection**
    - Right-click "PlayerShip.glb" asset
    - Click "Delete" in context menu
    - **Expected**: Warning dialog: "Asset in use by 1 GameObject(s): GameObject"
    - **Expected**: "Delete Anyway" and "Cancel" buttons
    - Click "Cancel"
    - **Verify**: Asset still in library

**Part 3 Success**: ✅ Asset management features working

---

### Final Validation

17. **Save Scene**
    - Click "Save Scene" in toolbar (or Ctrl+S)
    - **Expected**: Toast: "Scene saved successfully"

18. **Reload Page**
    - Press F5 to refresh browser
    - **Expected**: Scene loads with spaceship GameObject
    - **Expected**: Model3D component references "PlayerShip.glb"
    - **Expected**: Code component contains rotation script
    - **Expected**: Assets panel shows both assets

19. **Play Again**
    - Click "Play"
    - **Expected**: Spaceship rotates exactly as before
    - **Verify**: Scene persistence works correctly

**Final Success**: ✅ Full workflow validated with persistence

---

## Success Criteria

### All Tests Pass ✅

- [ ] Spaceship model uploaded and thumbnail generated
- [ ] Model3D component renders .glb file in viewport
- [ ] Scale adjustment updates model size in real-time
- [ ] Code component editor has syntax highlighting
- [ ] Rotation script executes during play mode
- [ ] 60 FPS maintained with model and code running
- [ ] Console shows log output from script
- [ ] Code saved as reusable asset
- [ ] Asset search filters correctly
- [ ] Asset rename updates references
- [ ] Delete protection prevents removing in-use assets
- [ ] Scene save/load preserves all data

### Performance Benchmarks

Measure and record:
- **Upload time**: spaceship.glb (~500KB) → Target: < 2 seconds
- **Thumbnail generation**: → Target: < 1 second
- **Model load time**: First render in viewport → Target: < 2 seconds
- **Code execution overhead**: Check FPS drop → Target: 59-60 FPS (< 1 FPS drop)
- **Scene save time**: With 1 model + 1 script → Target: < 500ms
- **Scene load time**: Full restoration → Target: < 2 seconds

### Edge Cases to Test

After main workflow:

20. **Upload Invalid File**
    - Try uploading a .txt file
    - **Expected**: Error: "Invalid file format. Supported: .glb, .gltf"

21. **Upload Large File**
    - Try uploading file > 50MB (if available)
    - **Expected**: Error: "File too large. Maximum: 50MB"

22. **Code Error Handling**
    - In Code component, write: `this.nonexistent.property = 5;`
    - Click Play
    - **Expected**: Error in Console: "Cannot read property of undefined"
    - **Expected**: Error line highlighted in Monaco Editor
    - **Expected**: Play mode continues (error caught, not crash)

23. **Infinite Loop Protection**
    - Write: `update() { while(true) {} }`
    - Click Play
    - **Expected**: After 100ms, error: "Code execution timeout"
    - **Expected**: Editor remains responsive

24. **Storage Quota Check**
    - Check console for storage usage message
    - **Expected**: No warnings (unless quota > 80%)

---

## Troubleshooting

### Model Doesn't Appear

- Check Console for GLTF loading errors
- Verify .glb file is valid (test in Blender or three.js editor)
- Check scale value (try 1.0, model might be too small/large)
- Verify Model3D component is enabled (checkbox)

### Code Doesn't Execute

- Verify Code component is on same GameObject as Transform
- Check Console for transpilation errors
- Ensure play mode is active (mode indicator shows "Playing")
- Check execution time display (if 0ms, code not running)

### Assets Not Persisting

- Check browser console for IndexedDB errors
- Verify browser supports IndexedDB (check `window.indexedDB`)
- Clear site data and re-upload if IndexedDB corrupted
- Check storage quota in browser DevTools > Application > Storage

### Performance Issues

- Check triangle count of model (should be < 10K for smooth performance)
- Monitor code execution time in Inspector (should be < 5ms)
- Reduce model scale if very large
- Check for infinite loops in code (execution time > 5ms is warning)

---

## Expected Results

**Total Time**: 4-5 minutes for complete workflow  
**User Experience**: Smooth, no errors, intuitive interface  
**Performance**: 60 FPS maintained throughout  
**Persistence**: All data survives page reload

If any step fails, refer to tasks.md to identify missing implementation.

