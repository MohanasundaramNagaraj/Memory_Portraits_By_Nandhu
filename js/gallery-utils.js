const GALLERY_CONFIG = {
    basePath: "assets/images/Gallery/",
    manifestPath: "gallery-manifest.json"
};

async function getGalleryClients() {
    const response = await fetch(GALLERY_CONFIG.manifestPath);

    if (!response.ok) {
        throw new Error("Unable to load gallery manifest");
    }

    const data = await response.json();
    return data.clients || [];
}

function getGalleryClient(clients, clientName) {
    return clients.find(client => client.name === clientName);
}

// Natural numeric sorting: 1.jpg, 2.jpg, 10.jpg, 11.jpg
function sortGalleryImages(images) {
    return [...images].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );
}

function getGalleryImagePath(clientName, imageName) {
    return GALLERY_CONFIG.basePath +
        encodeURIComponent(clientName) + "/" +
        encodeURIComponent(imageName);
}
