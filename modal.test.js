const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Helper function to wait for async operations like setTimeout
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('Image Modal Functionality', () => {
    let dom;
    let window;
    let document;

    beforeEach(() => {
        // Load the HTML file into a JSDOM instance before each test
        const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
        
        dom = new JSDOM(html, {
            runScripts: "dangerously", // Allows the script in your HTML to run
            url: "file://" + path.resolve(__dirname, '../index.html') // Sets a base URL for relative paths
        });

        window = dom.window;
        document = window.document;

        // Polyfill for requestAnimationFrame which JSDOM doesn't implement
        window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
    });

    test('modal should be hidden initially', () => {
        const imageModal = document.getElementById('imageModal');
        expect(imageModal.classList.contains('hidden')).toBe(true);
        expect(imageModal.classList.contains('opacity-0')).toBe(true);
    });

    describe('when a gallery item is clicked', () => {
        let galleryItem;
        let imageModal;
        let modalImage;

        beforeEach(async () => {
            galleryItem = document.querySelector('.gallery-image-item');
            imageModal = document.getElementById('imageModal');
            modalImage = document.getElementById('modalImage');

            // Simulate a user click on the first gallery item
            galleryItem.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
            // Wait for the requestAnimationFrame callback to fire
            await wait(10); 
        });

        test('modal should become visible', () => {
            expect(imageModal.classList.contains('hidden')).toBe(false);
            expect(imageModal.classList.contains('opacity-0')).toBe(false);
        });

        test('modal should display the correct image and alt text', () => {
            const galleryImg = galleryItem.querySelector('img');
            // JSDOM resolves the src path to a full file path
            expect(modalImage.src).toBe(galleryImg.src);
            expect(modalImage.alt).toBe(galleryImg.alt);
        });

        test('body should have overflow-hidden class to prevent scrolling', () => {
            expect(document.body.classList.contains('overflow-hidden')).toBe(true);
        });

        test('clicking the close button should hide the modal', () => {
            const closeModalBtn = document.getElementById('closeModal');
            closeModalBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
            
            expect(imageModal.classList.contains('opacity-0')).toBe(true);
            
            // Manually trigger the 'transitionend' event since JSDOM doesn't run CSS transitions
            imageModal.dispatchEvent(new window.Event('transitionend'));
            
            expect(imageModal.classList.contains('hidden')).toBe(true);
            expect(document.body.classList.contains('overflow-hidden')).toBe(false);
        });

        test('clicking the modal overlay should hide the modal', () => {
            // Simulate a click on the overlay itself, not the image inside
            imageModal.dispatchEvent(new window.MouseEvent('click', { bubbles: true, target: imageModal, currentTarget: imageModal }));
            
            expect(imageModal.classList.contains('opacity-0')).toBe(true);
            imageModal.dispatchEvent(new window.Event('transitionend'));
            expect(imageModal.classList.contains('hidden')).toBe(true);
        });

        test('pressing the Escape key should hide the modal', () => {
            document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            
            expect(imageModal.classList.contains('opacity-0')).toBe(true);
            imageModal.dispatchEvent(new window.Event('transitionend'));
            expect(imageModal.classList.contains('hidden')).toBe(true);
        });
    });
});