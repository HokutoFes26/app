#!/bin/bash

echo "WebP conversion start"

for file in *.jpg; do
  [ -e "$file" ] || continue
  echo "Converting $file..."
  cwebp -q 70 "$file" -o "${file%.jpg}.webp"
done

for file in *.png; do
  [ -e "$file" ] || continue
  echo "Converting $file..."
  cwebp -q 70 "$file" -o "${file%.png}.webp"
done

for file in *.gif; do
  [ -e "$file" ] || continue
  echo "Converting $file (GIF)..."
  gif2webp -q 70 "$file" -o "${file%.gif}.webp"
done

echo "WebP conversion finish"