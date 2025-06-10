/**
 * Card Enhancements JavaScript
 * Adds additional interactive features to the listing cards
 */

document.addEventListener('DOMContentLoaded', () => {
  // Select all the listing cards
  const listingCards = document.querySelectorAll('.listing-card');
  
  // Add intersection observer for lazy loading and animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // If the card is visible in the viewport
      if (entry.isIntersecting) {
        // Add a visible class to trigger animations
        entry.target.classList.add('card-visible');
        
        // Lazy load the images if they have data-src
        const img = entry.target.querySelector('img[data-src]');
        if (img) {
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
        }
        
        // Unobserve the card after it's been processed
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  });
  
  // Observe each card
  listingCards.forEach(card => {
    observer.observe(card);
    
    // Add hover effect only on non-touch devices
    if (window.matchMedia('(hover: hover)').matches) {
      card.addEventListener('mouseenter', () => {
        card.classList.add('is-hovered');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-hovered');
      });
    }
  });
  
  // Add smooth scrolling to card grid when navigating from filters
  const filterLinks = document.querySelectorAll('.filter');
  const cardGrid = document.querySelector('.card-grid');
  
  if (filterLinks.length && cardGrid) {
    filterLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Smooth scroll to the card grid
        cardGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  }
  
  // Add responsive image loading logic
  function handleResponsiveImages() {
    const cardImages = document.querySelectorAll('.card-img-top');
    const isMobile = window.innerWidth < 576;
    
    cardImages.forEach(img => {
      if (img.hasAttribute('data-mobile-src') && img.hasAttribute('data-desktop-src')) {
        img.src = isMobile ? img.getAttribute('data-mobile-src') : img.getAttribute('data-desktop-src');
      }
    });
  }
  
  // Call on load and on resize
  handleResponsiveImages();
  window.addEventListener('resize', handleResponsiveImages);
});