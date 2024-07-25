document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/timeline')
        .then(response => response.json())
        .then(data => {
            const timelineList = document.getElementById('timeline-list');
            data.forEach(item => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                timelineItem.innerHTML = `
                    <div class="timeline-card-box">
                        <div class="timeline-card-img-box">
                            <img src="${item.image_url}" alt="${item.season}">
                        </div>
                        <div class="timeline-card-info">
                            <div class="timeline-card-title">${item.season}</div>
                            <div class="timeline-card-date">${new Date(item.date).toLocaleDateString()}</div>
                            <div class="timeline-card-desc">${item.description}</div>
                        </div>
                    </div>
                `;
                timelineList.appendChild(timelineItem);
            });
        })
        .catch(error => console.error('Error fetching timeline data:', error));
});