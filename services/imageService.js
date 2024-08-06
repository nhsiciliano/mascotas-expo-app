export const getUserImageScr = imagePath => {
    if (imagePath) {
        return { uri: imagePath }
    } else {
        return require('../assets/images/defaultProfile.png')
    }
}