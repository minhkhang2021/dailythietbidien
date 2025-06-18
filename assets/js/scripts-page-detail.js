document.addEventListener("DOMContentLoaded", () => {
    /*** 1. Kích hoạt TAB chuyển nội dung ***/
    const tabsSelector = "prod-tab__item";
    const contentsSelector = "prod-tab__content";
    const tabActive = `${tabsSelector}--current`;
    const contentActive = `${contentsSelector}--current`;

    const tabContainers = document.querySelectorAll(".js-tabs");
    tabContainers.forEach((tabContainer) => {
        const tabs = tabContainer.querySelectorAll(`.${tabsSelector}`);
        const contents = tabContainer.querySelectorAll(`.${contentsSelector}`);
        tabs.forEach((tab, index) => {
            tab.onclick = () => {
                tabContainer.querySelector(`.${tabActive}`)?.classList.remove(tabActive);
                tabContainer.querySelector(`.${contentActive}`)?.classList.remove(contentActive);
                tab.classList.add(tabActive);
                contents[index].classList.add(contentActive);
            };
        });
    });
});

// “Xem thêm” / “Thu gọn”
document.querySelectorAll(".text-collapse").forEach((collapse) => {
    const toggleBtn = collapse.querySelector(".text-collapse__toggle");
    toggleBtn.addEventListener("click", () => {
        collapse.classList.toggle("expanded");
        toggleBtn.textContent = collapse.classList.contains("expanded") ? "Thu gọn" : "Xem thêm";
    });
});

//lấy nội dung từ thẻ <h1> và tự động điền vào một vị trí chỉ định khác trong trang
document.addEventListener("DOMContentLoaded", () => {
    // Lấy nội dung từ thẻ h1
    const h1Content = document.querySelector("h1")?.textContent;

    // Gán vào vị trí mong muốn
    if (h1Content) {
        const spanTarget = document.getElementById("target-span");
        const inputTarget = document.getElementById("target-input");

        if (spanTarget) spanTarget.textContent = h1Content;
        if (inputTarget) inputTarget.value = h1Content;
    }
});

// review form
document.getElementById("reviewForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    // Hiển thị kết quả tạm thời (demo frontend)
    const name = formData.get("name");
    const product = formData.get("product");
    const rating = formData.get("rating");
    const message = formData.get("message");
    const files = formData.getAll("image");

    let resultHTML = `<p><strong>${name}</strong> đánh giá <strong>${product}</strong> (${rating} sao):</p>`;
    resultHTML += `<p>"${message}"</p>`;

    if (files && files.length > 0 && files[0].name !== "") {
        resultHTML += `<p>Ảnh đã chọn:</p><ul>`;
        files.forEach((file) => {
            resultHTML += `<li>${file.name}</li>`;
        });
        resultHTML += `</ul>`;
    }

    document.getElementById("formResult").innerHTML = resultHTML;

    // Nếu muốn gửi đến server, dùng:
    /*
  fetch("/api/submit-review", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    alert("Đánh giá đã gửi thành công!");
  })
  .catch(err => {
    alert("Lỗi khi gửi đánh giá.");
  });
  */
});

function updateBreadcrumbsClass() {
    const breakpointLg = 992;
    const breadcrumbs = document.querySelector(".breadcrumbs");
    const items = breadcrumbs?.querySelectorAll(".breadcrumbs__item");

    if (!breadcrumbs || !items) return;

    if (items.length > 3 && window.innerWidth <= breakpointLg) {
        breadcrumbs.classList.add("is-trimmed");
    } else {
        breadcrumbs.classList.remove("is-trimmed");
    }
}

window.addEventListener("DOMContentLoaded", updateBreadcrumbsClass);
window.addEventListener("resize", updateBreadcrumbsClass);
