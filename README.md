# Tetris JS 🕹️

A modern implementation of the classic Tetris game, built entirely with vanilla HTML5, CSS3, and JavaScript.

<img width="750" height="550" alt="image" src="https://github.com/user-attachments/assets/dae201ef-a9c9-43ff-a236-0522120c878c" />

![Tetris JS Banner](https://via.placeholder.com/800x400/0a0a12/00f3ff?text=TETRIS+JS)


## ✨ Features

*   **Modern Aesthetic**: Deep dark background with a moving 3D grid animation and glowing tetrominoes.
*   **Glassmorphism UI**: Sleek, semi-transparent panels for score, level, and next piece preview.
*   **Smooth Animations**: Fluid movement and subtle glow effects.
*   **Responsive Design**: Playable on different screen sizes (desktop focused).
*   **Classic Gameplay**:
    *   Standard scoring system (100/300/500/800 points).
    *   Level progression (speed increases every 10 lines).
    *   Next piece preview.
    *   Hard drop and soft drop mechanics.
    *   Wall kicks (basic implementation).

## 🎮 Controls

| Key | Action |
| :--- | :--- |
| **← / →** | Move Piece Left / Right |
| **↑ / W** | Rotate Clockwise |
| **Q** | Rotate Counter-Clockwise |
| **↓** | Soft Drop (Faster Fall) |
| **Space** | Hard Drop (Instant Lock) |
| **P** | Pause / Resume Game |

## 🚀 How to Run

Since this project uses only standard web technologies, no build step is required!

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/bethelhem-dev/tetris-js.git
    ```
2.  **Open the game**:
    *   Simply double-click `index.html` to open it in your default browser.
    *   OR use a local server (like Live Server in VS Code) for the best experience.

## 🛠️ Technologies Used

*   **HTML5 Canvas**: For high-performance rendering of the game board.
*   **CSS3**:
    *   Flexbox for layout.
    *   CSS Variables for easy theming.
    *   Keyframe animations for the background.
    *   Backdrop-filter for glass effects.
*   **Vanilla JavaScript (ES6+)**:
    *   Game loop logic.
    *   Collision detection.
    *   Matrix manipulation.

## 🎨 Customization

You can easily tweak the visuals by editing the CSS Variables in `style.css`:

```css
:root {
    --bg-color: #0a0a12;       /* Background color */
    --highlight-color: #00f3ff; /* Primary neon color */
    --accent-color: #bc13fe;    /* Secondary neon color */
}
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with ❤️ by bethelhem-dev*
#









