import SaveCryptoCategories from './_lib/save_categories';

const saveCats =  new SaveCryptoCategories();

export async function loadCryptoCategories() {
    // add coin categories to the categories.json file by checking the logs for 
    // unrecognized categories - this is a manual step that 
    // should be automated in the future
    // updates categories, abreviation and long form, using 'categories.json'
    // if logs show a category without an abbreviation then 
    // add it to the categories.json file and run this script
    await saveCats.saveCategories();
}

export async function getCategories() {
    // original function used to build categories.json
    saveCats.pullCategories();
}
