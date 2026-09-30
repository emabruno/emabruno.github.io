# emmanuelbruno.com

My photography site, rebuilt as plain HTML so it can be hosted for free (no Squarespace).

```
index.html                 Homepage (hover a title to see that project's cover)
about/index.html           "Me" page
work/<project>/index.html  One folder per project — same addresses as the old Squarespace site
assets/style.css           All styling (fonts, layout, phone layout at the bottom)
assets/site.js             Slideshow arrows/swipe, homepage hover, fade-ins
images/xl/                 Large screens / Retina (3000 px wide)
images/                    Laptops (2500 px wide)
images/sm/                 Phones (1200 px wide)
images/thumb/              Slideshow thumbnails (240 px wide)
```

Each browser downloads only the size its screen needs. The photos were made from the
originals in `~/Desktop/website`, except four that only exist as Squarespace copies
(2500 px, no `xl` version): DSC02787, DSC03370, DSC03614 (portrait), DSC09299.

## Preview on my Mac

```bash
cd ~/Desktop/coding/emmanuelbruno-site && python3 -m http.server 8765
```

Then open http://localhost:8765 (Ctrl+C to stop).

## Adding a photo

Export the photo at full size as a high-quality JPEG (sRGB), name it `NEW.jpg`, put it in
`images/`, then make the other sizes from it (the full-size file is replaced by the 2500 px one):

```bash
cd ~/Desktop/coding/emmanuelbruno-site/images && sips --resampleWidth 3000 -s formatOptions 85 NEW.jpg --out xl/NEW.jpg && sips --resampleWidth 1200 -s formatOptions 84 NEW.jpg --out sm/NEW.jpg && sips --resampleWidth 240 -s formatOptions 75 NEW.jpg --out thumb/NEW.jpg && sips --resampleWidth 2500 -s formatOptions 86 NEW.jpg
```

In the project's `index.html`, copy one `<figure class="slide">…</figure>` line (and its
`<li>` thumbnail line) and change the file name, width and height.

## Pointing the domain at the new host

The domain is registered with Squarespace Domains. Cancelling the Squarespace *website*
plan does not cancel the domain — it stays yours and its DNS stays editable.

1. Publish this folder on the new host first and check it works on its temporary address.
2. In Squarespace → Domains → emmanuelbruno.com → DNS, delete the Squarespace records and
   add the ones the new host gives you. For GitHub Pages:
   - `A` records for `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - `CNAME` record for `www`: `<github-username>.github.io`
3. Wait until www.emmanuelbruno.com shows the new site (minutes to a few hours).
4. Only then cancel the Squarespace website subscription — **not** the domain.
