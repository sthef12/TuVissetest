const menuLateral = document.getElementById('corpo_categorias');

function openMenu() {
    console.log(menuLateral.style.display);
    if (menuLateral.style.display === '' || menuLateral.style.display === 'none') {
        menuLateral.style.display = 'block';
    } else if (menuLateral.style.display === 'block') {
        menuLateral.style.display = 'none';
    }
}