function switchTab(id, clickedButton) {

    const tabs = document.querySelectorAll('.tab');
    const tabSelectors = document.querySelectorAll('.tab-selector')
    for (let tab of tabs) {
        tab.hidden = true;
    }

    tabSelectors.forEach(selector => selector.classList.remove('active'));
    document.querySelector(id).hidden = false;
    clickedButton.classList.add('active');
}