// Aronetiv — client-side rendering of CMS-managed JSON content.
// No build step: each page fetches its data file and renders into the DOM.

async function getJSON(url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error("Failed to load " + url);
  return res.json();
}

// Split a plain-text/markdown body into <p> paragraphs (blank-line separated).
function paragraphs(body) {
  const frag = document.createDocumentFragment();
  (body || "")
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((para) => {
      const p = document.createElement("p");
      p.textContent = para;
      frag.appendChild(p);
    });
  return frag;
}

async function applySiteTitle() {
  try {
    const site = await getJSON("/data/site.json");
    if (site.title) {
      document
        .querySelectorAll("[data-site-title]")
        .forEach((el) => (el.textContent = site.title));
    }
  } catch (_) {
    /* keep fallback title from HTML */
  }
}

async function renderHome() {
  const root = document.getElementById("home");
  const data = await getJSON("/data/works.json");
  const works = data.works || [];
  const hero = works.find((w) => w.featured) || works[0];
  root.innerHTML = "";
  if (!hero) {
    root.innerHTML = '<p class="loading">No paintings yet.</p>';
    return;
  }
  // Full-bleed painting (the color strip is already baked into the image).
  const fig = document.createElement("figure");
  fig.className = "painting";
  const img = document.createElement("img");
  img.src = hero.image;
  img.alt = hero.alt || hero.title || "Painting";
  fig.appendChild(img);
  root.appendChild(fig);
}

async function renderWorks() {
  const root = document.getElementById("works");
  const data = await getJSON("/data/works.json");
  const works = data.works || [];
  root.innerHTML = "";
  if (!works.length) {
    root.innerHTML = '<p class="loading">No paintings yet.</p>';
    return;
  }
  works.forEach((work) => {
    const item = document.createElement("article");
    item.className = "work";

    const fig = document.createElement("figure");
    const img = document.createElement("img");
    img.src = work.image;
    img.alt = work.alt || work.title || "Painting";
    img.loading = "lazy";
    fig.appendChild(img);
    item.appendChild(fig);

    const cap = document.createElement("div");
    cap.className = "caption";
    if (work.title) {
      const t = document.createElement("span");
      t.className = "title";
      t.textContent = work.title;
      cap.appendChild(t);
    }
    if (work.year) {
      const y = document.createElement("span");
      y.className = "year";
      y.textContent = work.year;
      cap.appendChild(y);
    }
    item.appendChild(cap);
    root.appendChild(item);
  });
}

async function renderTextPage(source) {
  const root = document.getElementById("text");
  const data = await getJSON(source);
  const isAbout = (source || "").indexOf("about") !== -1;
  root.innerHTML = "";

  const body = document.createElement("div");
  body.className = isAbout ? "text-body is-about" : "text-body";
  body.appendChild(paragraphs(data.body));
  root.appendChild(body);

  // Links (e.g. "music albums") — underline under the first word only.
  if (Array.isArray(data.links) && data.links.length) {
    const links = document.createElement("div");
    links.className = "text-links";
    data.links.forEach((l) => {
      const a = document.createElement("a");
      a.href = l.url || "#";
      if (a.href !== "#") {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      const parts = (l.label || l.url || "").split(" ");
      const u = document.createElement("span");
      u.className = "u";
      u.textContent = parts[0];
      a.appendChild(u);
      if (parts.length > 1) {
        a.appendChild(document.createTextNode(" " + parts.slice(1).join(" ")));
      }
      links.appendChild(a);
    });
    root.appendChild(links);
  }

  // Contact line.
  if (data.email) {
    const c = document.createElement("p");
    c.className = "contact";
    c.appendChild(document.createTextNode("To get in touch, write to: "));
    const a = document.createElement("a");
    a.href = "mailto:" + data.email;
    a.textContent = data.email;
    c.appendChild(a);
    root.appendChild(c);
  }

  // Social icons.
  if (Array.isArray(data.socials) && data.socials.length) {
    const socials = document.createElement("div");
    socials.className = "socials";
    data.socials.forEach((s) => {
      const a = document.createElement("a");
      a.href = s.url || "#";
      a.className = s.fit === "ig" ? "ig" : "full";
      a.setAttribute("aria-label", s.platform || "social");
      if (a.href !== "#") {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      if (s.icon) {
        const img = document.createElement("img");
        img.src = s.icon;
        img.alt = s.platform || "";
        a.appendChild(img);
      } else {
        a.textContent = s.platform || "link";
      }
      socials.appendChild(a);
    });
    root.appendChild(socials);
  }

  // Signature color-code strip (image from the design), centered.
  const sig = document.createElement("div");
  sig.className = "signature";
  const sigImg = document.createElement("img");
  sigImg.src = data.colorcode || "/images/works/logo-colorcode.webp";
  sigImg.alt = "Color code";
  sig.appendChild(sigImg);
  root.appendChild(sig);
}

async function main() {
  await applySiteTitle();
  const page = document.body.dataset.page;
  try {
    if (page === "home") await renderHome();
    else if (page === "works") await renderWorks();
    else if (page === "text") await renderTextPage(document.body.dataset.source);
  } catch (err) {
    const root = document.querySelector("main");
    if (root) root.innerHTML = '<p class="loading">' + err.message + "</p>";
    console.error(err);
  }
}

main();
