window.addEventListener('load', function() {
    // Inject sr-only styles to ensure screen reader announcer is always hidden visually
    if (!document.getElementById('sr-only-styles')) {
        const style = document.createElement('style');
        style.id = 'sr-only-styles';
        style.innerHTML = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border-width: 0;
            }
        `;
        document.head.appendChild(style);
    }

    const indexPreloader = document.querySelector('.index-preloader');
    const standardPreloader = document.querySelector('.preloader');
    const body = document.querySelector('.body');

    function removePreloader(element) {
        setTimeout(function() {
            const announcer = document.getElementById('sr-announcer');
            if (announcer) {
                announcer.innerText = "loading finish";
                // Clear the announcer text after it has been read by screen readers
                setTimeout(() => {
                    announcer.innerText = "";
                }, 1000);
            }
            element.remove();
            if (body) body.style.display = "block";
        }, 1500);
    }

    if (indexPreloader) {
        removePreloader(indexPreloader);
    } else if (standardPreloader) {
        removePreloader(standardPreloader);
    }

    // Update copyright year robustly
    const footer = document.querySelector('footer');
    if (footer) {
        const paragraphs = footer.getElementsByTagName('p');
        if (paragraphs.length > 0) {
            const lastParagraph = paragraphs[paragraphs.length - 1];
            const currentYear = new Date().getFullYear();
            lastParagraph.innerHTML = `&copy; Copyright 2023 - ${currentYear} Blind Tech Agent. All Rights Reserved.`;
            lastParagraph.style.fontSize = '18px';
        }
    }
});