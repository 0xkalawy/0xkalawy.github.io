# 0xkalawy security research blog

A build-free static site by Mohamed Wagdy designed for GitHub Pages. Its visual identity is inspired by
Kalawy, the computer-genius character from the Egyptian film *El Rahina*, with an original
illustrated mascot in `assets/kalawy-mascot.png`.

## Preview

Open `index.html` directly, or run any local static server from this directory. For example:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Content

- `northstar.html` publishes the Northstar Player writeup.
- `posts/northstar-player/Write-up.md` keeps the Markdown source.
- `assets/posts/northstar-player/` contains the writeup media.
- The visual palette lives in the CSS variables at the top of `styles.css`.

The site has no build step and can be published directly through GitHub Pages.
