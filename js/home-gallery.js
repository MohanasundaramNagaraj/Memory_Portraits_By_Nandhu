document.addEventListener("DOMContentLoaded", loadHomeGallery);

async function loadHomeGallery() {
    const galleryContainer = document.getElementById("clientGallery");
    if (!galleryContainer) return;

    try {
        const clients = await getGalleryClients();
        galleryContainer.replaceChildren();

        clients.forEach(client => {
            const images = sortGalleryImages(client.images || []);
            if (images.length === 0) return;

            const figure = document.createElement("figure");
            figure.className = "gallery-item portrait";

            const link = document.createElement("a");
            link.className = "gallery-item__link";
            link.href = `gallery.html?client=${encodeURIComponent(client.name)}`;

            const img = document.createElement("img");
            img.src = getGalleryImagePath(client.name, images[0]);
            img.alt = client.name;
            img.width = 1080;
            img.height = 1350;
            img.loading = "lazy";

            const caption = document.createElement("figcaption");
            caption.className = "gallery-item__caption";

            const captionText = document.createElement("span");

            const label = document.createElement("span");
            label.className = "gallery-item__label";
            label.textContent = client.category || "Gallery";

            const title = document.createElement("span");
            title.className = "gallery-item__title";
            title.textContent = client.name;

            captionText.append(label, title);

            const icon = document.createElement("span");
            icon.className = "gallery-item__icon";
            icon.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
            `;

            caption.append(captionText, icon);
            link.append(img, caption);
            figure.appendChild(link);
            galleryContainer.appendChild(figure);

            img.addEventListener("error", () => figure.remove());
        });
    } catch (error) {
        console.error("Home gallery loading error:", error);
        galleryContainer.textContent = "Unable to load client galleries.";
    }
}
