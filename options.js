
const urlInput = document.getElementById('inputApiUrl');
const endpointInput = document.getElementById('inputApiEndpoint');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');
const statusBar = document.getElementById('status');

// Eklenti açıldığında kayıtlı URL varsa kutucuğa yazdır
chrome.storage.local.get(['savedUrl'], (result) => {
	if (result.savedUrl) {
		urlInput.value = result.savedUrl;
	}
});

chrome.storage.local.get(['savedEndpoint'], (result) => {
	if (result.savedEndpoint) {
		endpointInput.value = result.savedEndpoint;
	}
});

// Kaydet butonuna basıldığında
saveBtn.addEventListener('click', () => {
	const url = urlInput.value;
	const endpoint = endpointInput.value;
	if (url == '' || url == null) {
		statusBar.innerText = "URL boş olamaz!";
		return false;
	}
	if (endpoint == '' || endpoint == null) {
		statusBar.innerText = "Endpoint boş olamaz!";
		return false;
	}
	chrome.storage.local.set({ savedUrl: url, savedEndpoint: endpoint }, () => {
		statusBar.innerText = "Başarıyla kaydedildi!";
		console.log("Kaydedilen URL:", url, "Kaydedilen Endpoint:", endpoint);
	});
});

// Sil butonuna basıldığında
deleteBtn.addEventListener('click', () => {
	statusBar.innerText = "";
	chrome.storage.local.remove('savedUrl', () => {
		urlInput.value = "";
		statusBar.innerText += "URL silindi!";
		console.log("URL silindi");
	});
	chrome.storage.local.remove('savedEndpoint', () => {
		endpointInput.value = "";
		statusBar.innerText += "Endpoint silindi!";
		console.log("Endpoint silindi");
	});
});