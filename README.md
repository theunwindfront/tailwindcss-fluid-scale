# @theunwindfront/tailwindcss-fluid-scale

[![Latest Version on Packagist](https://img.shields.io/packagist/v/theunwindfront/tailwindcss-fluid-scale.svg?style=flat-square)](https://packagist.org/packages/theunwindfront/tailwindcss-fluid-scale)
[![Total Downloads](https://img.shields.io/packagist/dt/theunwindfront/tailwindcss-fluid-scale.svg?style=flat-square)](https://packagist.org/packages/theunwindfront/tailwindcss-fluid-scale)
[![NPM Version](https://img.shields.io/npm/v/%40theunwindfront/tailwindcss-fluid-scale.svg?style=flat-square)](https://www.npmjs.com/package/@theunwindfront/tailwindcss-fluid-scale)
[![License](https://img.shields.io/packagist/l/theunwindfront/tailwindcss-fluid-scale.svg?style=flat-square)](https://packagist.org/packages/theunwindfront/tailwindcss-fluid-scale)

A high-performance, design-system integrated Tailwind CSS v4 plugin to compile mathematically fluid typography and spacing scales dynamically using native CSS `clamp()`.

---

## The Problem
Managing perfectly fluid layouts across a wide range of devices usually requires declaring repetitive responsive breakpoints (such as `text-sm md:text-base lg:text-lg xl:text-3xl`). This creates verbose stylesheets, leads to repetitive code, and causes sudden, jarring layout jumps when screen sizes cross responsive boundaries.

## The Solution
This plugin calculates dynamic mathematical slopes on the fly, locking typography and spacing between a defined minimum viewport boundary (default `320px`) and a maximum viewport boundary (default `1536px` / `2xl`). 

Instead of jumping abruptly between breakpoints, sizes scale smoothly pixel-by-pixel:
```html
<!-- Typography locks smoothly between font-size 'sm' and '3xl' -->
<h1 class="fluid-text-sm-3xl font-black">Dynamic Title</h1>

<!-- Padding-x scales linearly from index 4 (16px) to 16 (64px) -->
<div class="fluid-px-4-16 border rounded-xl">
    Fluid Container Box
</div>
```

The plugin programmatically reads boundaries directly from the active `@theme` context (e.g. `screens.sm` and `screens.2xl`), ensuring fluid computations stay perfectly synchronized with your design system.

---

## Installation

```bash
npm install @theunwindfront/tailwindcss-fluid-scale
```

Add the plugin to your main stylesheet (Tailwind CSS v4):
```css
@import "tailwindcss";
@plugin "@theunwindfront/tailwindcss-fluid-scale";
```

For Tailwind v3, import it in `tailwind.config.js`:
```javascript
module.exports = {
  plugins: [
    require('@theunwindfront/tailwindcss-fluid-scale'),
  ],
}
```

---

## Usage Guide

### 1. Fluid Typography
Scale font sizes between standard Tailwind theme keys. Typographic scale declarations also preserve pre-configured line heights automatically:
```html
<h1 class="fluid-text-sm-3xl">Fluid Heading</h1>
<p class="fluid-text-xs-base text-slate-500">Fluid paragraph body</p>
```

### 2. Fluid Spacing (Padding, Margin, Gaps, Width, Height)
Scale distances linearly across viewports:
* **Padding**: `fluid-p-{min}-{max}`, `fluid-px-{min}-{max}`, `fluid-py-{min}-{max}`, `fluid-pt-*-*`, etc.
* **Margin**: `fluid-m-{min}-{max}`, `fluid-mx-{min}-{max}`, `fluid-my-{min}-{max}`, `fluid-mt-*-*`, etc.
* **Gaps**: `fluid-gap-{min}-{max}`, `fluid-gap-x-*-*`, `fluid-gap-y-*-*`
* **Dimensions**: `fluid-w-{min}-{max}`, `fluid-h-{min}-{max}`

```html
<div class="fluid-py-3-8 fluid-px-4-16 fluid-gap-2-8 grid grid-cols-3">
    <div>A</div>
    <div>B</div>
    <div>C</div>
</div>
```

### 3. Custom Arbitrary Calculations
If you need to bypass standard design tokens, you can input arbitrary pixel or rem sizes using bracket syntax. The compiler will calculate the exact slope equation automatically on the fly:
```html
<!-- Scales font-size from 12px to 60px -->
<span class="fluid-text-[12px-60px]">Huge Scaling Headline</span>

<!-- Scales padding-y from 1.5rem to 80px -->
<section class="fluid-py-[1.5rem-80px]">...</section>
```

---

## Configuration Options
You can configure custom default viewport ranges directly within the `@plugin` initialization block:
```css
@plugin "@theunwindfront/tailwindcss-fluid-scale" {
  minWidth: "375px";
  maxWidth: "1440px";
}
```

---

## 👥 Credits

- **[Sagar Pansuriya](https://github.com/theunwindfront)** - Lead Creator & Developer

## 🤝 Support

For questions or issues, contact **pansuriya.sagar94@gmail.com**

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
