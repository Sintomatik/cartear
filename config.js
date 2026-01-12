/**
 * ============================================
 * AR BUSINESS CARD - CONFIGURATION FILE
 * ============================================
 * 
 * Customize your AR business card by modifying
 * the values below. All placeholder content
 * can be replaced with your own information.
 * 
 */

const CARD_CONFIG = {
    // ==========================================
    // PERSONAL INFORMATION (Customize these!)
    // ==========================================
    personalInfo: {
        firstName: "ANTHONY",                    // Your first name
        surname: "MURACCIOLI",                   // Your surname
        title: "MMI 3",              // Your profession/title
        company: "IUT de Corte",              // Your company/school
        email: "muraccioli.anthony@gmail.com",           // Your email
        phone: "+33 6 76 82 23 75",             // Your phone number
        website: "www.darymura.net",       // Your website
        location: "Calenzana, Corse",            // Your location
    },

    // ==========================================
    // SOCIAL MEDIA LINKS (Customize these!)
    // ==========================================
    socialLinks: {
        linkedin: "#",
        github: "#",
        twitter: "#",
        portfolio: "https://darymura.net",
    },

    // ==========================================
    // CARD APPEARANCE (Customize colors & style)
    // ==========================================
    cardStyle: {
        // Main card colors
        primaryColor: 0x00d4ff,      // Accent color (cyan)
        secondaryColor: 0x0099cc,    // Secondary accent
        cardColor: 0x1a1a2e,         // Card background
        textColor: 0xffffff,         // Text color
        
        // Card dimensions (in 3D units)
        width: 8.5,
        height: 5.5,
        depth: 0.15,
        cornerRadius: 0.3,
        
        // Effects
        glowIntensity: 0.5,
        reflectionStrength: 0.3,
    },

    // ==========================================
    // INTERACTIVE ELEMENTS
    // ==========================================
    interactiveElements: {
        // Profile photo placeholder
        profilePhoto: {
            enabled: true,
            placeholder: false,  // Set to false when you add real image
            imageUrl: "./img/logo.png",       // Add your image URL here
            size: 1.6,
        },

        // 3D decorative elements
        decorations: {
            particles: true,
            floatingIcons: true,
            glowEffects: true,
        }
    },

    // ==========================================
    // AR MEDIA (Video background & Spatial Audio)
    // ==========================================
    arMedia: {
        video: {
            enabled: true,
            src: "./media/sky.mp4",           // Path to your background video
            width: 3,                          // Video plane width (relative to card)
            height: 2,                         // Video plane height
            opacity: 0.8,                      // Overall opacity
            fadeEdges: true,                   // Fade edges of video
            loop: true,                        // Loop the video
        },
        audio: {
            enabled: true,
            src: "./media/music.mp3",          // Path to your spatial audio
            volume: 0.5,                       // Volume (0-1)
            loop: true,                        // Loop the audio
            refDistance: 1,                    // Distance at which volume is 100%
            rolloffFactor: 1,                  // How quickly volume decreases with distance
        }
    },

    // ==========================================
    // MARKER AR SETTINGS (MindAR)
    // ==========================================
    markerAR: {
        enabled: true,
        markerFile: "./markers/target.mind",  // Path to your .mind marker file
        // Create marker at: https://hiukim.github.io/mind-ar-js-doc/tools/compile
    },

    // ==========================================
    // ANIMATION SETTINGS
    // ==========================================
    animations: {
        autoRotate: false,
        autoRotateSpeed: 0.5,
        floatAnimation: true,
        floatSpeed: 0.001,
        floatAmplitude: 0.1,
        hoverScale: 1.05,
        flipDuration: 1000,  // milliseconds
    },

    // ==========================================
    // SKILLS / EXPERTISE (Back of card)
    // ==========================================
    skills: [
        "Dev Web & Database",
        "Design Graphique",
        "SEO",
        "Marketing Digital",
        "Gestion de Projet",
    ],

    // ==========================================
    // ADDITIONAL INFO (Back of card)
    // ==========================================
    additionalInfo: {
        tagline: "",
        bio: "",
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CARD_CONFIG;
}
