window.addEventListener('DOMContentLoaded', () => {
  const viewerBox   = document.getElementById('viewerBox');
  const tooltip     = document.getElementById('tooltip');
  const detailPanel = document.getElementById('detailSidebar');
  const closeBtn    = document.getElementById('closeDetail');

  // 1) Show a tooltip placeholder on hover
  viewerBox.addEventListener('mousemove', e => {
    tooltip.style.display = 'block';
    // position it top-right of the box
    tooltip.style.top  = '12px';
    tooltip.style.left = `${e.clientX - viewerBox.getBoundingClientRect().left + 10}px`;
    tooltip.textContent = 'Muscle name…';
  });
  viewerBox.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });

  // 2) Click anywhere in the model to open the detail sidebar
  viewerBox.addEventListener('click', () => {
    detailPanel.style.display = 'block';
    tooltip.style.display     = 'none';
  });

  // 3) Close button hides it
  closeBtn.addEventListener('click', () => {
    detailPanel.style.display = 'none';
  });
});
