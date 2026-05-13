function applySort(val) {
    document.getElementById('sort-input').value = val;
    document.getElementById('filter-form').submit();
}

const trigger = document.getElementById('sort-trigger');
const popup = document.getElementById('sort-popup');

if (trigger && popup) {
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.classList.toggle('active');
    });
}

document.addEventListener('click', () => {
    if (popup) popup.classList.remove('active');
});

const slider = document.getElementById('price-slider');
const output = document.getElementById('price-limit');
const maxInput = document.getElementById('max-price');

if (slider) {
    slider.oninput = function () {
        output.innerText = this.value;
        maxInput.value = this.value;
    };
}
