# Marker Files for MindAR

This folder contains the marker/target files for MindAR image tracking.

## How to Create Your Marker File

1. Go to the MindAR Image Target Compiler: https://hiukim.github.io/mind-ar-js-doc/tools/compile

2. Upload your marker image (the image that will trigger AR):
   - Use a high-contrast image with clear features
   - Recommended size: 800x800 pixels or larger
   - Good markers: logos, business card designs, photos with distinct features
   - Bad markers: plain text, simple shapes, low-contrast images

3. Click "Compile" and download the `.mind` file

4. Save the `.mind` file in this folder as `target.mind`

5. Update your `config.js` to point to the marker file:
   ```javascript
   markerAR: {
       enabled: true,
       markerFile: "./markers/target.mind",
   }
   ```

## Tips for Good Markers

- Use images with lots of unique visual features
- Avoid repetitive patterns
- Include your business card design or logo as the marker
- Test the marker in different lighting conditions
- Print the marker at a reasonable size (at least 5x5 cm)

## Example Workflow

1. Design your physical business card
2. Use the card image as the marker
3. When someone scans your physical card, the AR version appears!
