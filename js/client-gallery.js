document.addEventListener("DOMContentLoaded", loadClientGallery);

async function loadClientGallery() {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get("client");

    const gallery = document.getElementById("photoGallery");
    const notFound = document.getElementById("notFound");
    const clientTitle = document.getElementById("clientTitle");
    const clientCategory = document.getElementById("clientCategory");
    const photoCount = document.getElementById("photoCount");

    if (!gallery || !notFound || !clientTitle || !clientCategory || !photoCount) return;

    function showGalleryNotFound() {
        gallery.hidden = true;
        notFound.hidden = false;
        clientTitle.textContent = "Gallery Not Found";
        clientCategory.textContent = "Client Gallery";
        photoCount.textContent = "";
    }

    try {
        if (!clientId) {
            showGalleryNotFound();
            return;
        }

        const clients = await getGalleryClients();
        const client = getGalleryClient(clients, clientId);

        if (!client) {
            showGalleryNotFound();
            return;
        }

        const images = sortGalleryImages(client.images || []);
        if (images.length === 0) {
            showGalleryNotFound();
            return;
        }

        document.title = `${client.name} | Memory Portraits By Nandhu`;
        clientTitle.textContent = client.name;
        clientCategory.textContent = client.category || "Client Gallery";
        photoCount.textContent = `${images.length} photographs`;

        gallery.hidden = false;
        notFound.hidden = true;
        gallery.replaceChildren();

        images.forEach((imageName, index) => {
            const imagePath = getGalleryImagePath(client.name, imageName);

            const figure = document.createElement("figure");
            figure.className = "gallery-item portrait";

            const link = document.createElement("a");
            link.className = "gallery-item__link";
            link.href = imagePath;
            link.target = "_blank";
            link.rel = "noopener";

            const img = document.createElement("img");
            img.src = imagePath;
            img.alt = `${client.name} — photograph ${index + 1}`;
            img.loading = "lazy";

            // Keep the gallery page's original image-only appearance.
            link.appendChild(img);
            figure.appendChild(link);
            gallery.appendChild(figure);

            img.addEventListener("error", () => {
                figure.remove();
                const remaining = gallery.querySelectorAll(".gallery-item").length;
                photoCount.textContent = `${remaining} photographs`;
            });
        });
    } catch (error) {
        console.error("Client gallery loading error:", error);
        showGalleryNotFound();
    }
}
