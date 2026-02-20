
const urlInput = document.getElementById('urlInput');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');
const statusBar = document.getElementById('status');

// Eklenti açıldığında kayıtlı URL varsa kutucuğa yazdır
chrome.storage.local.get(['savedUrl'], (result) => {
	if (result.savedUrl) {
		urlInput.value = result.savedUrl;
	}
});

// Kaydet butonuna basıldığında
saveBtn.addEventListener('click', () => {
	const url = urlInput.value;
	if (url == '' || url == null) {
		statusBar.innerText = "URL boş olamaz!";
		return false;
	}
	chrome.storage.local.set({ savedUrl: url }, () => {
		statusBar.innerText = "Başarıyla kaydedildi!";
		console.log("Kaydedilen URL:", url);
	});
});

// Sil butonuna basıldığında
deleteBtn.addEventListener('click', () => {
	chrome.storage.local.remove('savedUrl', () => {
		urlInput.value = "";
		statusBar.innerText = "Başarıyla silindi!";
		console.log("URL silindi");
	});
});