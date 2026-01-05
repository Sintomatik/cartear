# AR Business Card with Three.js

An interactive 3D business card with AR capabilities built using Three.js for educational purposes.

## 🎯 Features

- **3D Interactive Card**: Fully interactive business card with front and back sides
- **AR Ready**: WebXR support for augmented reality viewing on compatible devices
- **Interactive Elements**: 
  - Profile photo placeholder
  - Social media icons (clickable)
  - QR code placeholder
  - Company logo placeholder
  - Skill tags
- **Animations**:
  - Auto-rotation
  - Card flip animation
  - Floating decorative elements
  - Particle system background
  - Glow effects
- **Customizable**: Easy configuration through `config.js`

## 🚀 Quick Start

1. **Open the project**: Simply open `index.html` in a modern web browser

2. **For local development** (recommended):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx serve .
   
   # Or using VS Code Live Server extension
   ```

3. **Open in browser**: Navigate to `http://localhost:8000`

## ⚙️ Customization

Edit `config.js` to personalize your card:

### Personal Information
```javascript
personalInfo: {
    name: "YOUR NAME HERE",
    title: "Your Job Title",
    company: "Company Name",
    email: "email@example.com",
    phone: "+1 234 567 8900",
    website: "www.yourwebsite.com",
    location: "City, Country",
}
```

### Social Links
```javascript
socialLinks: {
    linkedin: "https://linkedin.com/in/yourprofile",
    github: "https://github.com/yourusername",
    twitter: "https://twitter.com/yourhandle",
    portfolio: "https://yourportfolio.com",
}
```

### Card Styling
```javascript
cardStyle: {
    primaryColor: 0x00d4ff,    // Accent color
    cardColor: 0x1a1a2e,       // Card background
    textColor: 0xffffff,       // Text color
}
```

### Adding Your Images

1. **Profile Photo**: Set `profilePhoto.imageUrl` in config
2. **QR Code**: Generate a vCard QR and set `qrCode.imageUrl`
3. **Logo**: Set `logo.imageUrl` with your company logo

## 🎮 Controls

| Control | Action |
|---------|--------|
| **Mouse Drag** | Rotate the card |
| **Scroll** | Zoom in/out |
| **Auto Rotate** | Toggle automatic rotation |
| **Flip Card** | See the back of the card |
| **Reset View** | Return to default view |
| **Enter AR** | Start AR mode (on supported devices) |

## 📱 AR Mode

AR mode works on:
- Android devices with ARCore support
- iOS devices with Safari 15.4+
- WebXR compatible browsers

**Note**: AR requires HTTPS in production or localhost for development.

## 📁 Project Structure

```
carte-visite-ar/
├── index.html      # Main HTML file
├── config.js       # Configuration file (customize here!)
├── card.js         # Main Three.js application
└── README.md       # This file
```

## 🔧 Technical Details

- **Three.js r128**: 3D rendering library
- **OrbitControls**: Camera controls for interaction
- **WebXR**: AR capabilities
- **Canvas API**: Dynamic texture generation
- **CSS3**: Modern styling with glassmorphism effects

## 📝 TODO / Ideas for Extension

- [ ] Add marker-based AR using AR.js
- [ ] Implement image tracking for physical card
- [ ] Add sound effects on interactions
- [ ] Create animation for card appearance
- [ ] Add vCard download functionality
- [ ] Implement multi-language support
- [ ] Add dark/light theme toggle

## 🎓 Educational Notes

This project demonstrates:
1. **Three.js Fundamentals**: Scene, Camera, Renderer setup
2. **3D Objects**: Meshes, Materials, Geometries
3. **Lighting**: Ambient, Directional, Point lights
4. **User Interaction**: Raycasting for click detection
5. **Animation**: requestAnimationFrame loop, tweening
6. **Shaders**: Basic GLSL for glow effects
7. **WebXR**: AR session management
8. **Responsive Design**: Window resize handling

## 📄 License

Free to use for educational purposes.

---

Made with ❤️ using Three.js
