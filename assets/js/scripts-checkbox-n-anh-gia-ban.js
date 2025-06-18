document.addEventListener("DOMContentLoaded", () => {
    const currentFileName = window.location.pathname
        .split("/")
        .pop()
        .replace(/\.html$/, "");
    const jsonUrl = `/assets/data/${currentFileName}.json`;

    const groupEls = document.querySelectorAll(".prod-checkbox-group");
    const imageContainer = document.querySelector(".prod-checkbox-image");
    const priceContainer = document.querySelector(".prod-checkbox-price");
    const titleContainer = document.querySelector(".prod-checkbox-title");
    const thumbnailContainer = document.querySelector(".prod-checkbox-thumbnails");
    const mode = parseInt(groupEls[0]?.dataset.mode || "1");

    fetch(jsonUrl)
        .then((res) => res.json())
        .then((data) => {
            if (mode === 1) renderGlobalThumbnails(data);
            groupEls.forEach((groupEl) => renderLevel(data, 0, groupEl, true));
        })
        .catch((err) => console.error("Lỗi khi load JSON:", err));

    function renderLevel(data, level, parentEl, autoSelect) {
        // Xóa cấp đã có
        parentEl.querySelectorAll(`.attribute-level[data-level="${level}"]`).forEach((el) => el.remove());

        const wrapper = document.createElement("div");
        wrapper.className = "attribute-level";
        wrapper.dataset.level = level;

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
                    renderLevel(item.children, level + 1, parentEl, true);
                } else {
                    showProduct(item);
                }
            });

            wrapper.appendChild(option);

            if (autoSelect && index === 0) {
                setTimeout(() => option.click(), 0);
            }
        });

        parentEl.appendChild(wrapper);
    }

    function removeActiveAtLevel(level, container) {
        container
            .querySelectorAll(`.attribute-level[data-level="${level}"] .attribute-option`)
            .forEach((opt) => opt.classList.remove("active"));
    }

    function showProduct(product) {
        const rawPrice = parseInt(product.price.replace(/[^\d]/g, ""));
        const discount = product.discount || 0;
        const finalPrice = rawPrice - (rawPrice * discount) / 100;
        const formatVND = (n) => n.toLocaleString("vi-VN") + "đ";

        if (titleContainer) {
            titleContainer.innerHTML = `<div class="prod-checkbox-name">${product.name}</div>`;
        }

        if (imageContainer) {
            imageContainer.style.display = "block";
            imageContainer.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="prod-checkbox-image__img" />
            `;
        }

        if (priceContainer) {
            priceContainer.innerHTML = `
                <div class="prod-checkbox-original"><s>${formatVND(rawPrice)}</s></div>
                <div class="prod-checkbox-discount">${discount}%</div>
                <div class="prod-checkbox-final">${formatVND(finalPrice)}</div>
            `;
        }

        if (mode === 1 && thumbnailContainer) {
            const allThumbs = thumbnailContainer.querySelectorAll(".prod-checkbox-thumbnail");
            allThumbs.forEach((t) => t.classList.remove("active"));

            const matchedThumb = [...allThumbs].find((t) => t.src.includes(product.image));
            if (matchedThumb) {
                matchedThumb.classList.add("active");
                const trackRect = thumbnailContainer.getBoundingClientRect();
                const thumbRect = matchedThumb.getBoundingClientRect();
                const scrollLeft = matchedThumb.offsetLeft - trackRect.width / 2 + thumbRect.width / 2;
                thumbnailContainer.scrollTo({ left: scrollLeft, behavior: "smooth" });
            }
        }

        if (mode === 2 && thumbnailContainer && Array.isArray(product.thumbnails)) {
            thumbnailContainer.innerHTML = "";

            product.thumbnails.forEach((url, index) => {
                const thumb = document.createElement("img");
                thumb.src = url;
                thumb.alt = product.name;
                thumb.className = "prod-checkbox-thumbnail";
                if (index === 0) thumb.classList.add("active");

                thumb.addEventListener("click", () => {
                    imageContainer.innerHTML = `
                        <img src="${url}" alt="${product.name}" class="prod-checkbox-image__img" />
                    `;
                    thumbnailContainer
                        .querySelectorAll(".prod-checkbox-thumbnail")
                        .forEach((t) => t.classList.remove("active"));
                    thumb.classList.add("active");
                });

                thumbnailContainer.appendChild(thumb);
            });
        }
    }

    function renderGlobalThumbnails(data) {
        if (!thumbnailContainer) return;
        thumbnailContainer.innerHTML = "";

        const allImages = [];

        function collectImages(items) {
            items.forEach((item) => {
                if (item.image) allImages.push({ url: item.image, name: item.name || "Ảnh sản phẩm" });
                if (item.children) collectImages(item.children);
            });
        }

        collectImages(data);

        allImages.forEach(({ url, name }) => {
            const thumb = document.createElement("img");
            thumb.src = url;
            thumb.alt = name;
            thumb.className = "prod-checkbox-thumbnail";

            thumb.addEventListener("click", () => {
                imageContainer.style.display = "block";
                imageContainer.innerHTML = `
                    <img src="${url}" alt="${name}" class="prod-checkbox-image__img" />
                `;
                thumbnailContainer
                    .querySelectorAll(".prod-checkbox-thumbnail")
                    .forEach((t) => t.classList.remove("active"));
                thumb.classList.add("active");
            });

            thumbnailContainer.appendChild(thumb);
        });
    }
});
