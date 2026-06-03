// Change Status
const buttonsChangeStatus = document.querySelectorAll("[button-change-status]");
if (buttonsChangeStatus.length > 0) {
    const formChangeStatus = document.querySelector("#form-change-status");
    if(formChangeStatus) {
        const path = formChangeStatus.getAttribute("data-path");
        buttonsChangeStatus.forEach(button => {
            button.addEventListener("click", () => {
                const statusCurrent = button.getAttribute("data-status");
                const id = button.getAttribute("data-id");
                
                const statusChange = statusCurrent === "active" ? "inactive" : "active";
                
                const action = path + `/${statusChange}/${id}?_method=PATCH`;
                formChangeStatus.action = action;
                
                formChangeStatus.submit();
            });
        });
    }
}

// Delete Item
const buttonsDelete = document.querySelectorAll("[button-delete]");
if (buttonsDelete.length > 0) {
    const formDeleteItem = document.querySelector("#form-delete-item");
    if(formDeleteItem) {
        const path = formDeleteItem.getAttribute("data-path");
        buttonsDelete.forEach(button => {
            button.addEventListener("click", () => {
                const isConfirm = confirm("Bạn có chắc chắn muốn xóa bản ghi này?");
                if (isConfirm) {
                    const id = button.getAttribute("data-id");
                    const action = path + `/${id}?_method=DELETE`;
                    formDeleteItem.action = action;
                    formDeleteItem.submit();
                }
            });
        });
    }
}

// Restore Item
const buttonsRestore = document.querySelectorAll("[button-restore]");
if (buttonsRestore.length > 0) {
    const formRestoreItem = document.querySelector("#form-restore-item");
    if(formRestoreItem) {
        const path = formRestoreItem.getAttribute("data-path");
        buttonsRestore.forEach(button => {
            button.addEventListener("click", () => {
                const isConfirm = confirm("Bạn có chắc chắn muốn khôi phục bản ghi này?");
                if (isConfirm) {
                    const id = button.getAttribute("data-id");
                    const action = path + `/${id}?_method=PATCH`;
                    formRestoreItem.action = action;
                    formRestoreItem.submit();
                }
            });
        });
    }
}

// Delete Permanent Item
const buttonsDeletePermanent = document.querySelectorAll("[button-delete-permanent]");
if (buttonsDeletePermanent.length > 0) {
    const formDeletePermanentItem = document.querySelector("#form-delete-permanent-item");
    if(formDeletePermanentItem) {
        const path = formDeletePermanentItem.getAttribute("data-path");
        buttonsDeletePermanent.forEach(button => {
            button.addEventListener("click", () => {
                const isConfirm = confirm("Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa vĩnh viễn?");
                if (isConfirm) {
                    const id = button.getAttribute("data-id");
                    const action = path + `/${id}?_method=DELETE`;
                    formDeletePermanentItem.action = action;
                    formDeletePermanentItem.submit();
                }
            });
        });
    }
}
