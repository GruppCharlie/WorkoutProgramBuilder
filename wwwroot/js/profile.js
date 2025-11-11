document.addEventListener('DOMContentLoaded', () => {

const modal = document.getElementById("achievementModal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.getElementById("closeModalBtn");

if (modal && openBtn && closeBtn) {
    function openModal() {
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.classList.add("hidden");
        document.body.style.overflow = "";
    }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);

    const modalContent = modal.querySelector(".bg-white");

    modal.addEventListener("click", (e) => {
        if (!modalContent.contains(e.target)) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
    });
}

    const editBtn = document.querySelector('#editPersonalInfoBtn');
    const cancelBtn = document.querySelector('#cancelEditBtn');
    const displaySection = document.querySelector('#personalInfoDisplay');
    const form = document.querySelector('#userForm');
    const infoSection = document.querySelector('#personalInfoSection');


    if (!editBtn || !form || !displaySection) return;

    const successText = infoSection.dataset.successText; 
    const errorText = infoSection.dataset.errorText 

    editBtn.addEventListener('click', () => {
        displaySection.classList.add('hidden');
        form.classList.remove('hidden');
        editBtn.classList.add('hidden');
    });

    cancelBtn?.addEventListener('click', () => {
        displaySection.classList.remove('hidden');
        form.classList.add('hidden');
        editBtn.classList.remove('hidden');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const details = {
            Age: parseInt(document.querySelector('#userAgeInput').value, 10),
            Gender: document.querySelector('#userGenderInput').value,
            Weight: parseFloat(document.querySelector('#userWeightInput').value),
            Height: parseFloat(document.querySelector('#userHeightInput').value)
        };

        try {
            const res = await saveMemberDetails(details);

            if (res.ok) {
                document.querySelector('#personalInfoDisplay p:nth-child(1) strong').nextSibling.textContent = ` ${details.Age}`;
                document.querySelector('#personalInfoDisplay p:nth-child(2) strong').nextSibling.textContent = ` ${details.Gender}`;
                document.querySelector('#personalInfoDisplay p:nth-child(3) strong').nextSibling.textContent = ` ${details.Weight}`;
                document.querySelector('#personalInfoDisplay p:nth-child(4) strong').nextSibling.textContent = ` ${details.Height}`;

                showSuccessToast(successText);
                displaySection.classList.remove('hidden');
                form.classList.add('hidden');
                editBtn.classList.remove('hidden');
            } else {
                showErrorToast(errorText);
                console.error(await res.text());
            }
        } catch (err) {
            showErrorToast(err);
        }
    });
});