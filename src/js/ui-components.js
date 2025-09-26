// UI Component Utilities

// Snackbar
export function showSnackbar(message, type = 'info', duration = 3000) {
    const snackbar = document.createElement('div');
    snackbar.className = 'snackbar animate-slide-up';
    
    const content = document.createElement('div');
    content.className = `snackbar-content flex items-center ${
        type === 'error' ? 'bg-red-500' : 
        type === 'success' ? 'bg-green-500' : 
        'bg-gray-800'
    }`;
    
    content.textContent = message;
    snackbar.appendChild(content);
    document.body.appendChild(snackbar);
    
    setTimeout(() => {
        snackbar.classList.replace('animate-slide-up', 'animate-fade-out');
        setTimeout(() => snackbar.remove(), 300);
    }, duration);
}

// Carousel
export class Carousel {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            autoplay: options.autoplay || false,
            interval: options.interval || 5000,
            ...options
        };
        
        this.items = Array.from(element.children);
        this.currentIndex = 0;
        
        this.init();
    }
    
    init() {
        this.items.forEach((item, index) => {
            item.className = `carousel-item ${index === 0 ? 'translate-x-0' : 'translate-x-full'}`;
        });
        
        if (this.items.length > 1) {
            this.createNavigation();
            if (this.options.autoplay) {
                this.startAutoplay();
            }
        }
    }
    
    createNavigation() {
        const nav = document.createElement('div');
        nav.className = 'carousel-nav';
        
        this.items.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(index));
            nav.appendChild(dot);
        });
        
        this.element.appendChild(nav);
    }
    
    goToSlide(index) {
        const currentSlide = this.items[this.currentIndex];
        const nextSlide = this.items[index];
        
        currentSlide.classList.replace('translate-x-0', 'translate-x-full');
        nextSlide.classList.replace('translate-x-full', 'translate-x-0');
        
        this.updateNavigation(index);
        this.currentIndex = index;
    }
    
    updateNavigation(index) {
        const dots = this.element.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    startAutoplay() {
        this.autoplayInterval = setInterval(() => {
            const nextIndex = (this.currentIndex + 1) % this.items.length;
            this.goToSlide(nextIndex);
        }, this.options.interval);
    }
    
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
    }
}

// Breadcrumb
export function createBreadcrumb(items) {
    const container = document.createElement('nav');
    container.className = 'breadcrumb';
    
    items.forEach((item, index) => {
        const link = document.createElement('a');
        link.href = item.href;
        link.className = 'breadcrumb-item';
        link.textContent = item.text;
        
        container.appendChild(link);
        
        if (index < items.length - 1) {
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = '/';
            container.appendChild(separator);
        }
    });
    
    return container;
}

// Skeleton Loading
export function createSkeleton(type = 'text', options = {}) {
    const element = document.createElement('div');
    
    switch (type) {
        case 'text':
            element.className = `skeleton h-4 ${options.width || 'w-3/4'}`;
            break;
        case 'circle':
            element.className = `skeleton rounded-full ${options.size || 'w-12 h-12'}`;
            break;
        case 'rectangle':
            element.className = `skeleton ${options.width || 'w-full'} ${options.height || 'h-32'}`;
            break;
        case 'card':
            element.className = 'card animate-pulse space-y-4';
            element.innerHTML = `
                <div class="skeleton w-full h-48 rounded-lg"></div>
                <div class="space-y-2">
                    <div class="skeleton h-4 w-3/4"></div>
                    <div class="skeleton h-4 w-1/2"></div>
                </div>
            `;
            break;
    }
    
    return element;
}

// Scroll Progress
export function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress w-0';
    document.body.prepend(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });
}

// Chips
export function createChip(text, options = {}) {
    const chip = document.createElement('div');
    chip.className = options.removable ? 'chip-removable' : 'chip';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    chip.appendChild(textSpan);
    
    if (options.removable) {
        const removeButton = document.createElement('button');
        removeButton.className = 'chip-remove';
        removeButton.innerHTML = '×';
        removeButton.addEventListener('click', () => {
            chip.remove();
            if (options.onRemove) options.onRemove(text);
        });
        chip.appendChild(removeButton);
    }
    
    return chip;
}

// Bento Grid
export function createBentoGrid(items) {
    const grid = document.createElement('div');
    grid.className = 'bento-grid';
    
    items.forEach(item => {
        const bentoItem = document.createElement('div');
        bentoItem.className = `bento-item ${item.large ? 'bento-item-large' : ''}`;
        
        const content = document.createElement('div');
        content.className = 'relative p-6 h-full';
        content.innerHTML = item.content;
        
        bentoItem.appendChild(content);
        grid.appendChild(bentoItem);
    });
    
    return grid;
}