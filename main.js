


const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const trackingAndPaymentSources = [
    'www.google-analytics.com', 'ssl.google-analytics.com',
    'static.hotjar.com', 'script.hotjar.com', 'vars.hotjar.com',
    'connect.facebook.net',
    'mouseflow.com',
    'cdn.mxpnl.com',
    'script.crazyegg.com',
    'js.hs-scripts.com',
    'static.getclicky.com',
    'piwik.js', 'matomo.js',
    'cdn.segment.com',
    'cdn.optimizely.com',
    'widget.intercom.io',
    'cdn.heapanalytics.com',
    'www.googletagmanager.com',
    'js.stripe.com',
    'www.paypal.com', 'www.paypalobjects.com',
    // ... Add more known tracking and payment sources here
];

function removeTrackingAndPaymentScripts(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content, { decodeEntities: false });

    // Remove script tags based on src attribute or inner content
    $('script').each((i, elem) => {
        const src = $(elem).attr('src');
        const innerScriptContent = $(elem).html();

        if ((src && trackingAndPaymentSources.some(source => src.includes(source))) ||
            (innerScriptContent && (
                innerScriptContent.includes("function gtag()") || 
                innerScriptContent.toLowerCase().includes("checkout") || 
                innerScriptContent.toLowerCase().includes("payment") || 
                trackingAndPaymentSources.some(source => innerScriptContent.includes(source))
            ))) {
            $(elem).remove();
        }
    });

    // Remove Facebook Pixel noscript tags and any other noscript tags that may contain payment info
    $('noscript').each((i, elem) => {
        const innerHTML = $(elem).html();
        if (innerHTML.includes("https://www.facebook.com/tr?id=") ||
            innerHTML.toLowerCase().includes("checkout") ||
            innerHTML.toLowerCase().includes("payment")) {
            $(elem).remove();
        }
    });

    fs.writeFileSync(filePath, $.html());
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (let file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            traverseDir(filePath);
        } else if (path.extname(filePath) === '.html') {
            removeTrackingAndPaymentScripts(filePath);
        }
    }
}



const rootDir = 'www.raiselli.com/'; // Current directory
traverseDir(rootDir);
