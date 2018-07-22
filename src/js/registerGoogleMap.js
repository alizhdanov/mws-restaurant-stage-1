import GoogleMapsLoader from 'google-maps';

GoogleMapsLoader.KEY = 'AIzaSyC0SKLqoNyihvyvXcg1LuusMewXaFNFvJA';

// hand made wrapper for google maps npm plugin
const maps = () => new Promise((resolve) => {
    GoogleMapsLoader.load((google) => {
        resolve(google)
    });
});

export default maps;
