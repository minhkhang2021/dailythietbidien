function load(selector, path) {
    const cached = localStorage.getItem(path);
    if (cached) {
        document.querySelector(selector).innerHTML = cached;
    }

    fetch(path)
        .then((res) => res.text())
        .then((html) => {
            if (html !== cached) {
                document.querySelector(selector).innerHTML = html;
                localStorage.setItem(path, html);
            }
        });
}

/**
 * Giữ active menu khi hover
 *
 * Cách dùng:
 * 1. Thêm class "js-menu-list" vào thẻ ul menu chính
 * 2. Thêm class "js-dropdown" vào class "dropdown" hiện tại
 *  nếu muốn reset lại item active khi ẩn menu
 */
window.addEventListener("template-loaded", handleActiveMenu);

function handleActiveMenu() {
    const dropdowns = $$(".js-dropdown");
    const menus = $$(".js-menu-list");
    const activeClass = "menu-column__item--active";

    const removeActive = (menu) => {
        menu.querySelector(`.${activeClass}`)?.classList.remove(activeClass);
    };

    const init = () => {
        menus.forEach((menu) => {
            const items = menu.children;
            if (!items.length) return;

            removeActive(menu);
            items[0].classList.add(activeClass);

            Array.from(items).forEach((item) => {
                item.onmouseenter = () => {
                    if (window.innerWidth <= 991) return;
                    removeActive(menu);
                    item.classList.add(activeClass);
                };
            });
        });
    };

    init();

    dropdowns.forEach((dropdown) => {
        dropdown.onmouseleave = () => init();
    });
}

//===================

window.onload = function () {
    document.querySelectorAll(".checkbox-container.level-1").forEach((container) => {
        const first = container.querySelector(".checkbox-item");
        if (first) toggleSelection(first);
    });
};

// Hàm xử lý chọn checkbox
function toggleSelection(selectedItem) {
    const container = selectedItem.closest(".checkbox-container");
    const group = container.getAttribute("data-group");
    const level = container.classList.contains("level-1") ? 1 : 2;
    const option = selectedItem.getAttribute("data-option");

    // Cập nhật class selected/deselected
    container.querySelectorAll(".checkbox-item").forEach((item) => {
        item.classList.remove("selected");
        item.classList.add("deselected");
    });
    selectedItem.classList.add("selected");
    selectedItem.classList.remove("deselected");

    // Nếu là nhóm cấp 1 → bật nhóm con phù hợp
    if (level === 1) {
        document.querySelectorAll(`.checkbox-container.level-2[data-parent="${group}"]`).forEach((sub) => {
            const parentOption = sub.getAttribute("data-parent-option");
            if (parentOption === option) {
                sub.classList.add("active");
                const first = sub.querySelector(".checkbox-item");
                if (first) toggleSelection(first); // auto chọn mục đầu tiên
            } else {
                sub.classList.remove("active");
            }
        });
    }

    // Nếu là nhóm cấp 2 → hiện ảnh
    if (level === 2) {
        const parentContainer = container.getAttribute("data-parent");
        const allImages = document.querySelectorAll(
            `.prod-preview__list[data-group="${parentContainer}"] .prod-preview__item`
        );
        allImages.forEach((img) => img.classList.remove("active"));

        const imageClass = `${parentContainer}-${option}`;
        const targetImage = document.querySelector(
            `.prod-preview__list[data-group="${parentContainer}"] .${imageClass}`
        );
        if (targetImage) targetImage.classList.add("active");
    }
}
