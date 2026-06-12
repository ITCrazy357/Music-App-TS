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
                    
                    // Add hidden input for method-override
                    let hiddenInput = formDeleteItem.querySelector('input[name="_method"]');
                    if (!hiddenInput) {
                        hiddenInput = document.createElement("input");
                        hiddenInput.type = "hidden";
                        hiddenInput.name = "_method";
                        formDeleteItem.appendChild(hiddenInput);
                    }
                    hiddenInput.value = "DELETE";

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


// Pagination
const buttonsPagination = document.querySelectorAll('[button-pagination]');
if (buttonsPagination.length > 0) {
    let url = new URL(window.location.href);
    buttonsPagination.forEach(button => {
        button.addEventListener('click', () => {
            const page = button.getAttribute('button-pagination');
            url.searchParams.set('page', page);
            window.location.href = url.href;
        });
    });
}

// Filter Status
const buttonsStatus = document.querySelectorAll('[button-status]');
if (buttonsStatus.length > 0) {
    let url = new URL(window.location.href);
    buttonsStatus.forEach(button => {
        button.addEventListener('click', () => {
            const status = button.getAttribute('button-status');
            if (status) {
                url.searchParams.set('status', status);
            } else {
                url.searchParams.delete('status');
            }
            url.searchParams.delete('page'); // Reset page when filtering
            window.location.href = url.href;
        });
    });
}

// Form Search
const formSearch = document.querySelector('#form-search');
if (formSearch) {
    let url = new URL(window.location.href);
    formSearch.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const keywordInput = e.target.elements.keyword;
        if (keywordInput) {
            const keyword = keywordInput.value;
            if (keyword) {
                url.searchParams.set('keyword', keyword);
            } else {
                url.searchParams.delete('keyword');
            }
        }
        
        const roleIdInput = e.target.elements.role_id;
        if (roleIdInput) {
            const role_id = roleIdInput.value;
            if (role_id) {
                url.searchParams.set('role_id', role_id);
            } else {
                url.searchParams.delete('role_id');
            }
        }

        url.searchParams.delete('page'); // Reset page when searching
        window.location.href = url.href;
    });
}

// Checkbox Multi
const checkboxMulti = document.querySelector('[checkbox-multi]');
if (checkboxMulti) {
    const inputCheckAll = checkboxMulti.querySelector('input[name="checkall"]');
    const inputsId = checkboxMulti.querySelectorAll('input[name="id"]');

    if (inputCheckAll) {
        inputCheckAll.addEventListener('click', () => {
            if (inputCheckAll.checked) {
                inputsId.forEach(input => {
                    input.checked = true;
                });
            } else {
                inputsId.forEach(input => {
                    input.checked = false;
                });
            }
        });

        inputsId.forEach(input => {
            input.addEventListener('click', () => {
                const countChecked = checkboxMulti.querySelectorAll('input[name="id"]:checked').length;
                if (countChecked == inputsId.length) {
                    inputCheckAll.checked = true;
                } else {
                    inputCheckAll.checked = false;
                }
            });
        });
    }
}

// Form Change Multi
const formChangeMulti = document.querySelector('[form-change-multi]');
if (formChangeMulti) {
    formChangeMulti.addEventListener('submit', (e) => {
        e.preventDefault();
        const checkboxMulti = document.querySelector('[checkbox-multi]');
        const inputsChecked = checkboxMulti.querySelectorAll('input[name="id"]:checked');
        
        if (inputsChecked.length > 0) {
            let ids = [];
            inputsChecked.forEach(input => {
                const id = input.value;
                ids.push(id);
            });
            const inputIds = formChangeMulti.querySelector('input[name="ids"]');
            inputIds.value = ids.join(', ');
            formChangeMulti.submit();
        } else {
            alert('Vui l�ng ch?n �t nh?t m?t b?n ghi!');
        }
    });
}

