document.addEventListener("DOMContentLoaded", () => {
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const fileName = pathParts.at(-1).replace(/\.html$/, "");
    const folderName = pathParts.at(-2);
    const jsonUrl = `/assets/data/${folderName}/${fileName}.json`;

    const groupEls = document.querySelectorAll(".prod-checkbox-group");
    const imageContainer = document.querySelector(".prod-checkbox-image");
    const priceContainer = document.querySelector(".prod-checkbox-price");
    const titleContainer = document.querySelector(".prod-checkbox-title");
    const thumbnailContainer = document.querySelector(".prod-checkbox-thumbnails");
    const zoomToggle = document.getElementById("zoomToggle");
    const zoomLens = document.getElementById("zoomLens");
    const mode = parseInt(groupEls[0]?.dataset.mode || "1");

    const leftArrow = document.querySelector(".thumbnail-arrow.left");
    const rightArrow = document.querySelector(".thumbnail-arrow.right");

    let isZoomEnabled = false;

    if (zoomToggle) {
        zoomToggle.addEventListener("change", (e) => {
            isZoomEnabled = e.target.checked;
            if (!isZoomEnabled && zoomLens) zoomLens.style.display = "none";
        });
    }

    fetch(jsonUrl)
        .then((res) => {
            if (!res.ok) throw new Error(`❌ JSON load failed: ${res.status}`);
            return res.json();
        })
        .then((data) => {
            if (mode === 1) renderGlobalThumbnails(data);
            groupEls.forEach((groupEl) => renderLevel(data, 0, groupEl, true));
        })
        .catch((err) => {
            console.error("⚠️ Không load được JSON:", jsonUrl);
            console.error(err);
        });

    function renderLevel(data, level, parentEl, autoSelect) {
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
                requestAnimationFrame(() => option.click());
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
        const priceValue = product.price?.toString().replace(/[^\d]/g, "") || "";
        const isNumeric = /^\d+([\.,]?\d+)?$/.test(priceValue);
        const discount = product.discount || 0;
        const formatVND = (n) => n.toLocaleString("vi-VN") + "đ";

        if (titleContainer) {
            titleContainer.innerHTML = `<div class="prod-checkbox-name">${product.name}</div>`;
        }

        if (imageContainer) {
            imageContainer.innerHTML = `
                <img src="${product.image}" alt="${product.name}" id="mainProductImage" class="prod-checkbox-image__img" />
            `;
            const imgEl = document.getElementById("mainProductImage");
            applyZoomEffect(imgEl);
        }

        if (priceContainer) {
            if (isNumeric) {
                const rawPrice = parseInt(priceValue);
                const finalPrice = rawPrice - (rawPrice * discount) / 100;
                priceContainer.innerHTML = `
                    <div class="prod-checkbox-original"><s>${formatVND(rawPrice)}</s></div>
                    <div class="prod-checkbox-discount">${discount}%</div>
                    <div class="prod-checkbox-final">${formatVND(finalPrice)}</div>
                `;
            } else {
                priceContainer.innerHTML = `<div class="prod-checkbox-final is-string">${product.price}</div>`;
            }
        }

        // ⭐ THUMBNAILS CHO MODE 2 ⭐
        if (mode === 2 && thumbnailContainer) {
            thumbnailContainer.innerHTML = "";
            if (Array.isArray(product.thumbnails)) {
                product.thumbnails.forEach((thumbUrl, index) => {
                    const thumb = document.createElement("img");
                    thumb.src = thumbUrl;
                    thumb.alt = product.name;
                    thumb.className = "prod-checkbox-thumbnail";
                    if (index === 0) thumb.classList.add("active");

                    thumb.addEventListener("click", () => {
                        const mainImage = document.getElementById("mainProductImage");
                        if (mainImage) mainImage.src = thumbUrl;
                        if (zoomLens && isZoomEnabled) {
                            zoomLens.style.backgroundImage = `url(${thumbUrl})`;
                        }
                        thumbnailContainer
                            .querySelectorAll(".prod-checkbox-thumbnail")
                            .forEach((t) => t.classList.remove("active"));
                        thumb.classList.add("active");
                    });

                    thumbnailContainer.appendChild(thumb);
                });
            }
        }

        // ⭐ MODE 1: Đánh dấu active thumbnail (từ global)
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
    }

    function applyZoomEffect(imgEl) {
        const lens = zoomLens;
        const lensSize = 150;

        imgEl.addEventListener("mousemove", (e) => {
            if (!isZoomEnabled || !lens) {
                lens.style.display = "none";
                return;
            }

            const rect = imgEl.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            lens.style.display = "block";
            lens.style.left = `${x - lensSize / 2}px`;
            lens.style.top = `${y - lensSize / 2}px`;
            lens.style.width = `${lensSize}px`;
            lens.style.height = `${lensSize}px`;
            lens.style.backgroundImage = `url(${imgEl.src})`;
            lens.style.backgroundRepeat = "no-repeat";
            lens.style.backgroundSize = `${imgEl.width * 2}px ${imgEl.height * 2}px`;
            lens.style.backgroundPosition = `-${x * 2 - lensSize / 2}px -${y * 2 - lensSize / 2}px`;
        });

        imgEl.addEventListener("mouseleave", () => {
            if (lens) lens.style.display = "none";
        });
    }

    function renderGlobalThumbnails(data) {
        if (!thumbnailContainer) return;
        thumbnailContainer.innerHTML = "";

        const allImages = [];

        function collectImages(items, path = []) {
            items.forEach((item, i) => {
                const currentPath = [...path, i];
                if (item.image)
                    allImages.push({ url: item.image, name: item.name || "Ảnh sản phẩm", path: currentPath });
                if (item.children) collectImages(item.children, currentPath);
            });
        }

        collectImages(data);

        allImages.forEach(({ url, name, path }) => {
            const thumb = document.createElement("img");
            thumb.src = url;
            thumb.alt = name;
            thumb.className = "prod-checkbox-thumbnail";

            thumb.addEventListener("click", () => {
                const matched = findProductByImage(data, url);
                if (matched) {
                    renderSelectionPath(data, matched.path, groupEls[0], () => {
                        showProduct(matched.item);
                    });
                }

                thumbnailContainer
                    .querySelectorAll(".prod-checkbox-thumbnail")
                    .forEach((t) => t.classList.remove("active"));
                thumb.classList.add("active");
            });

            thumbnailContainer.appendChild(thumb);
        });
    }

    function findProductByImage(data, imageUrl, path = [], level = 0) {
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const newPath = [...path, i];
            if (item.image && item.image === imageUrl) {
                return { item, path: newPath };
            }
            if (item.children) {
                const found = findProductByImage(item.children, imageUrl, newPath, level + 1);
                if (found) return found;
            }
        }
        return null;
    }

    function renderSelectionPath(data, path, parentEl = groupEls[0], onComplete = () => {}) {
        let currentData = data;

        function selectNextLevel(level) {
            if (level >= path.length) {
                onComplete();
                return;
            }

            const index = path[level];
            const wrapper = parentEl.querySelector(`.attribute-level[data-level="${level}"]`);
            if (!wrapper) {
                renderLevel(currentData, level, parentEl, false);
            }

            setTimeout(() => {
                const options = parentEl.querySelectorAll(`.attribute-level[data-level="${level}"] .attribute-option`);
                const targetOption = options[index];
                if (targetOption) {
                    targetOption.click();
                    currentData = currentData[index]?.children || [];
                    selectNextLevel(level + 1);
                } else {
                    onComplete();
                }
            }, 50);
        }

        selectNextLevel(0);
    }

    const scrollAmount = 100;
    if (leftArrow && rightArrow && thumbnailContainer) {
        leftArrow.addEventListener("click", () => {
            thumbnailContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        });
        rightArrow.addEventListener("click", () => {
            thumbnailContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
        });
    }
});
