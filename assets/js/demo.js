document.addEventListener("DOMContentLoaded", () => {
    const productGroups = document.querySelectorAll(".product-group");

    productGroups.forEach((groupEl) => {
        const groupKey = groupEl.dataset.group;
        const mode = parseInt(groupEl.dataset.mode || "1"); // 👈 Lấy mode từ HTML

        const imageContainer = document.getElementById(`product-image-${groupKey}`);
        const priceContainer = document.getElementById(`product-price-${groupKey}`);
        const jsonUrl = `/assets/data/${groupKey}.json`;

        fetch(jsonUrl)
            .then((res) => res.json())
            .then((data) => {
                if (mode === 1) renderGlobalThumbnails(data, groupKey);
                renderLevel(data, 0, groupEl, true, groupKey, imageContainer, priceContainer, mode);
            })
            .catch((err) => console.error(`Lỗi khi load JSON cho nhóm ${groupKey}:`, err));
    });

    function renderLevel(data, level, parentEl, autoSelect, groupKey, imageContainer, priceContainer, mode) {
        const existing = parentEl.querySelectorAll(`.attribute-level`);
        existing.forEach((el) => {
            if (+el.dataset.level >= level) el.remove();
        });

        const wrapper = document.createElement("div");
        wrapper.className = "attribute-level";
        wrapper.dataset.level = level;
        wrapper.dataset.group = groupKey;

        const title = document.createElement("div");
        title.className = "attribute-title";
        title.textContent = data[0]?.title || `Chọn cấp ${level + 1}`;
        wrapper.appendChild(title);

        data.forEach((item, index) => {
            const option = document.createElement("div");
            option.className = "attribute-option";
            option.textContent = item.label || item.name;

            option.addEventListener("click", () => {
                removeActiveAtLevel(level, parentEl);
                option.classList.add("active");

                if (item.children) {
                    imageContainer.innerHTML = "";
                    priceContainer.innerHTML = "";
                    renderLevel(
                        item.children,
                        level + 1,
                        parentEl,
                        true,
                        groupKey,
                        imageContainer,
                        priceContainer,
                        mode
                    );
                } else {
                    showProduct(item, groupKey, imageContainer, priceContainer, mode);
                }
            });

            wrapper.appendChild(option);
            if (autoSelect && index === 0) setTimeout(() => option.click(), 0);
        });

        parentEl.appendChild(wrapper);
    }

    function removeActiveAtLevel(level, container) {
        const options = container.querySelectorAll(`.attribute-level[data-level="${level}"] .attribute-option`);
        options.forEach((opt) => opt.classList.remove("active"));
    }

    function showProduct(product, groupKey, imageContainer, priceContainer, mode) {
        const titleContainer = document.getElementById(`product-title-${groupKey}`);
        const thumbnailContainer = document.getElementById(`thumbnail-track-${groupKey}`);

        const rawPrice = parseInt(product.price.replace(/[^\d]/g, ""));
        const discount = product.discount || 0;
        const finalPrice = rawPrice - (rawPrice * discount) / 100;
        const formatVND = (n) => n.toLocaleString("vi-VN") + "đ";

        if (titleContainer) {
            titleContainer.innerHTML = `<div class="product-name">Tên sản phẩm: ${product.name}</div>`;
        }

        imageContainer.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image__img" />
        `;

        priceContainer.innerHTML = `
            <div class="product-original"><s>${formatVND(rawPrice)}</s></div>
            <div class="product-discount">${discount}%</div>
            <div class="product-final">${formatVND(finalPrice)}</div>
        `;

        if (mode === 2) {
            if (product.thumbnails && Array.isArray(product.thumbnails)) {
                thumbnailContainer.innerHTML = "";
                product.thumbnails.forEach((thumbUrl, index) => {
                    const thumb = document.createElement("img");
                    thumb.src = thumbUrl;
                    thumb.className = "product-thumbnail";
                    if (index === 0) thumb.classList.add("active");

                    thumb.addEventListener("click", () => {
                        imageContainer.innerHTML = `
                            <img src="${thumbUrl}" alt="${product.name}" class="product-image__img" />
                        `;
                        const allThumbs = thumbnailContainer.querySelectorAll(".product-thumbnail");
                        allThumbs.forEach((t) => t.classList.remove("active"));
                        thumb.classList.add("active");
                    });

                    thumbnailContainer.appendChild(thumb);
                });
            } else {
                thumbnailContainer.innerHTML = "";
            }
        }

        if (mode === 1) {
            const allThumbs = document.querySelectorAll(`#thumbnail-track-${groupKey} .product-thumbnail`);
            allThumbs.forEach((t) => {
                t.classList.remove("active");

                if (t.src.includes(product.image)) {
                    t.classList.add("active");

                    const thumbnailTrack = document.getElementById(`thumbnail-track-${groupKey}`);
                    const trackRect = thumbnailTrack.getBoundingClientRect();
                    const thumbRect = t.getBoundingClientRect();
                    const scrollTo = t.offsetLeft - trackRect.width / 2 + thumbRect.width / 2;
                    thumbnailTrack.scrollTo({ left: scrollTo, behavior: "smooth" });
                }
            });
        }
    }

    function renderGlobalThumbnails(data, groupKey) {
        const thumbnailContainer = document.getElementById(`thumbnail-track-${groupKey}`);
        thumbnailContainer.innerHTML = "";

        const allImages = [];

        function collectImages(items) {
            items.forEach((item) => {
                if (item.image) allImages.push(item.image);
                if (item.children) collectImages(item.children);
            });
        }

        collectImages(data);

        allImages.forEach((url) => {
            const thumb = document.createElement("img");
            thumb.src = url;
            thumb.className = "product-thumbnail";

            thumb.addEventListener("click", () => {
                const imageContainer = document.getElementById(`product-image-${groupKey}`);
                imageContainer.innerHTML = `
                    <img src="${url}" alt="Ảnh sản phẩm" class="product-image__img" />
                `;

                const allThumbs = thumbnailContainer.querySelectorAll(".product-thumbnail");
                allThumbs.forEach((t) => t.classList.remove("active"));
                thumb.classList.add("active");
            });

            thumbnailContainer.appendChild(thumb);
        });
    }

    document.querySelectorAll(".thumbnail-arrow").forEach((arrow) => {
        arrow.addEventListener("click", () => {
            const direction = arrow.classList.contains("left") ? -1 : 1;
            const groupKey = arrow.dataset.group;
            const track = document.getElementById(`thumbnail-track-${groupKey}`);
            if (track) track.scrollLeft += direction * 100;
        });
    });
});
