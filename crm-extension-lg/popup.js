(async () => {
  // 1. Aktif sekmeyi bul
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // 2. Aktif sayfanın içine input değerini okuyan kodu enjekte et
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // ID'si 'myInputId' olan input elementini bul
      const inputIsemriNo = document.getElementById("MainFrame_mainVframeset_workVframeset_mdiFrameset_MENU00000_form_divMain_divWork_serviceReceiptNo_input");
      const inputCustomerName = document.getElementById("MainFrame_mainVframeset_workVframeset_mdiFrameset_MENU00000_form_divMain_divWork_customerName_input");
      
      // Element varsa değerini döndür, yoksa null döndür
      return {
        isemriNo: inputIsemriNo ? inputIsemriNo.value : null,
        customerName: inputCustomerName ? inputCustomerName.value : null,
      };
    }
  }, (results) => {
    // 3. Gelen sonucu kontrol et ve popup.html içinde göster
    const sonucDiv = document.getElementById("sonuc");
    
    if (results && results[0] && results[0].result !== null) {
      // Eğer input boşsa kullanıcıya bilgi ver, doluysa değeri yaz
      sonucDiv.innerText = results[0].result === "" ? "(İnput içi boş)" : results[0].result;
      document.getElementById("isemriNo").innerText = results[0].result.isemriNo;
      document.getElementById("musteriAdi").innerText = results[0].result.customerName;
    } else {
      sonucDiv.innerText = "ID'si 'myInputId' olan bir input bulunamadı.";
    }
  });
})();