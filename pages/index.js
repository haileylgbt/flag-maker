import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import ReactDOMServer from 'react-dom/server';
import Canvg, { presets } from 'canvg';
const defaultFlags = [
  ['FF0018', 'FFA52C', 'FFFF41', '008018', '0000F9', '86007D'],
  ['55CDFC', 'F7A8B8', 'FFFFFF', 'F7A8B8', '55CDFC'],
  ['FFF430', 'FFFFFF', '9C59D1', '000000'],
  ['FF1B8D', 'FFDA00', '1BB3FF'],
  ['000000', 'A4A4A4', 'FFFFFF', '810081'],
  ['3AA63F', 'A8D47A', 'FFFFFF', 'AAAAAA', '000000'],
  ['D60270', 'D60270', '9B4F96', '0038A8', '0038A8'],
  ['D62900', 'FF9B55', 'FFFFFF', 'D461A6', 'A50062'],
  ['078d70', '27ceaa', '98e8c1', 'ffffff', '7bade2', '5049cc', '3d1a78'],
];
export default function Home() {
  const [colors, setColors] = useState([]);
  const [colorsModified, setColorsModified] = useState(false);
  useEffect(() => {
    setColors(defaultFlags.random().map((n) => n.toUpperCase()));
    if (location.hash) {
      try {
        setColors(JSON.parse(atob(location.hash.substr(1))));
      } catch (e) {}
    }
  }, []);
  useEffect(
    () => colorsModified && (location.hash = btoa(JSON.stringify(colors))),
    [colors]
  );
  return (
    <div className={styles.container}>
      <Head>
        <title>Flag Maker</title>
        <meta property="og:title" content="Flag Maker" />
        <meta
          property="og:description"
          content="Create striped flags easily with Flag Maker"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className={styles.header}>Flag Maker</h1>
      <div className={styles.holder}>
        <div className={styles.leftColumn}>
          <div className={styles.colorBoxes}>
            {colors.map((color, i) => (
              <FlagColorBox
                color={color}
                colors={colors}
                key={i}
                removeColor={() => {
                  setColors(arrayWithoutElementAtIndex(colors, i));
                  setColorsModified(true);
                }}
                updateColor={(color) => {
                  setColors(Object.assign([], colors, { [i]: color }));
                  setColorsModified(true);
                }}
              />
            ))}
          </div>
          <button
            className={styles.addButton}
            onClick={() => {
              setColors([...colors, defaultFlags.random().random()]);
              setColorsModified(true);
            }}
          >
            Add
          </button>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.flag}>{generateFlag(colors, 6)}</div>
          <div className={styles.exportButtons}>
            <button
              className={styles.exportButton}
              onClick={() => downloadPNG(generateFlag(colors))}
            >
              Download as PNG
            </button>
            <button
              className={styles.exportButton}
              onClick={() => downloadSVG(generateFlag(colors))}
            >
              Download as SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function downloadSVG(svg) {
  let xml = ReactDOMServer.renderToStaticMarkup(svg);
  var svgBlob = new Blob([xml], { type: 'image/svg;charset=utf-8' });
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement('a');
  downloadLink.href = svgUrl;
  downloadLink.download = 'flag.svg';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
async function downloadPNG(svg) {
  let xml = ReactDOMServer.renderToStaticMarkup(svg);
  const canvas = new OffscreenCanvas(1920, 1152);
  const ctx = canvas.getContext('2d');
  let v = await Canvg.from(ctx, xml, presets.offscreen());
  await v.render();
  var downloadLink = document.createElement('a');
  const blob = await canvas.convertToBlob();
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = 'flag.png';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function generateFlag(colors) {
  const width = 500;
  const height = 300;
  const stripeHeight = height / colors.length;
  let lastColor = null;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      {colors.map((color, i) => {
        const rect = color != lastColor && (
          <rect
            x={0}
            y={i * stripeHeight}
            width="100%"
            height={`${100 - (100 / colors.length) * i}%`}
            fill={'#' + color}
            key={i}
          />
        );
        lastColor = color;
        return rect;
      })}
    </svg>
  );
}
function FlagColorBox({ color, removeColor, updateColor, colors }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div className={styles.flagColorBox}>
      <div
        className={styles.colorSwatch}
        style={{ backgroundColor: '#' + color }}
        onClick={() => setPickerOpen(true)}
      />
      {pickerOpen && (
        <div
          className={styles.outsideClickCatcher}
          onClick={() => setPickerOpen(false)}
        />
      )}
      {pickerOpen && (
        <SketchPicker
          color={color}
          onChange={({ hex }) =>
            pickerOpen && updateColor(hex.replace('#', '').toUpperCase())
          }
          className={styles.colorPicker}
          presetColors={Array.from(
            new Set([
              ...colors.map((c) => `#${c}`),
              '#D0021B',
              '#F5A623',
              '#F8E71C',
              '#8B572A',
              '#7ED321',
              '#417505',
              '#BD10E0',
              '#9013FE',
              '#4A90E2',
              '#50E3C2',
              '#B8E986',
              '#000000',
              '#4A4A4A',
              '#9B9B9B',
              '#FFFFFF',
            ])
          )}
        />
      )}
      <div className={styles.colorHexCode} onClick={() => setPickerOpen(true)}>
        #{color}
      </div>
      <FaTimes className={styles.removeColor} onClick={removeColor} />
    </div>
  );
}
const arrayWithoutElementAtIndex = function (arr, index) {
  return arr.filter(function (value, arrIndex) {
    return index !== arrIndex;
  });
};
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};
