export class VisualEffects {
    constructor(sensitivity = 15) {
        this.sensitivity = sensitivity;
    }

    init3DTilt(selector) {
        const cards = document.querySelectorAll(selector);

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                card.style.transform = `
                    perspective(1000px) 
                    rotateX(${-y / this.sensitivity}deg) 
                    rotateY(${x / this.sensitivity}deg) 
                    scale(1.02)
                `;
                card.style.transition = 'none';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
                card.style.transition = `transform 0.4s ease-out`;
            });
        });
    }
}