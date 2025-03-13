# Excalidraw

**Excalidraw** is exported as a component to directly embed in your projects.

This is a forked package of Excalidraw with the following modifications:
*	Added collaborative editing using Yjs
*	Fixed shortcut key issues when using multiple instances
*	Removed the Mermaid feature
*	Removed other features deemed unnecessary


## Installation

You can use `npm`

```bash
npm install react react-dom @oviceinc/excalidraw
```

or via `yarn`

```bash
yarn add react react-dom @oviceinc/excalidraw
```

#### Note

## Dimensions of Excalidraw

Excalidraw takes _100%_ of `width` and `height` of the containing block so make sure the container in which you render Excalidraw has non zero dimensions.
