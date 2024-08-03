document.addEventListener('DOMContentLoaded', () => {
  const quoteElement = document.getElementById('quote');
  const authorElement = document.getElementById('author');
  const newQuoteButton = document.getElementById('new-quote-button');
  const favoriteQuoteButton = document.getElementById('favorite-quote-button');
  const themeToggleButton = document.getElementById('theme-toggle-button');
  const speakQuoteButton = document.getElementById('speak-quote-button');
  const copyQuoteButton = document.getElementById('copy-quote-button');
  const favoritesList = document.getElementById('favorites-list');
  const favoritesContainer = document.getElementById('favorites-container');
  const loadingSpinner = document.getElementById('loading-spinner');
  const notification = document.getElementById('notification');

  // Load favorites from local storage
  const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
  savedFavorites.forEach(quote => addFavoriteQuote(quote));

  // Initialize theme
  if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark');
  }

  async function fetchQuote() {
      showLoadingSpinner(true);
      const url = 'https://api.quotable.io/random';
      try {
          const response = await fetch(url);
          const data = await response.json();
          displayQuote(data.content, data.author);
          showNotification('New quote loaded!');
      } catch (error) {
          displayError('Error loading quote.');
          console.error('Error loading quote:', error);
      } finally {
          showLoadingSpinner(false);
      }
  }

  function displayQuote(quote, author) {
      quoteElement.textContent = quote;
      authorElement.textContent = `- ${author}`;
      quoteElement.classList.add('fade-in');
      authorElement.classList.add('fade-in');
      setTimeout(() => {
          quoteElement.classList.remove('fade-in');
          authorElement.classList.remove('fade-in');
      }, 1000);
  }

  function displayError(message) {
      quoteElement.textContent = message;
      authorElement.textContent = '';
  }

  function saveFavorite() {
      const quoteText = quoteElement.textContent;
      const authorText = authorElement.textContent;
      if (quoteText && authorText && !isDuplicateFavorite(quoteText, authorText)) {
          const favorite = { quote: quoteText, author: authorText };
          addFavoriteQuote(favorite);
          saveFavoritesToLocalStorage();
          showNotification('Added to favorites!');
      }
  }

  function addFavoriteQuote(favorite) {
      const listItem = document.createElement('li');
      listItem.textContent = `${favorite.quote} ${favorite.author}`;

      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.classList.add('remove-favorite');
      removeButton.onclick = () => {
          listItem.remove();
          saveFavoritesToLocalStorage();
          if (favoritesList.children.length === 0) {
              favoritesContainer.style.display = 'none';
          }
          showNotification('Removed from favorites!');
      };

      listItem.appendChild(removeButton);
      favoritesList.appendChild(listItem);
      favoritesContainer.style.display = 'block';
  }

  function isDuplicateFavorite(quote, author) {
      const items = favoritesList.getElementsByTagName('li');
      for (let item of items) {
          if (item.textContent.startsWith(quote) && item.textContent.endsWith(author)) {
              return true;
          }
      }
      return false;
  }

  function saveFavoritesToLocalStorage() {
      const favorites = [];
      const items = favoritesList.getElementsByTagName('li');
      for (let item of items) {
          const text = item.textContent.replace('Remove', '').trim();
          const [quote, author] = text.split(/ - /);
          favorites.push({ quote, author });
      }
      localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  function toggleTheme() {
      document.body.classList.toggle('dark');
      localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
      showNotification('Theme toggled!');
  }

  function speakQuote() {
      const quoteText = quoteElement.textContent;
      const authorText = authorElement.textContent;
      const utterance = new SpeechSynthesisUtterance(`${quoteText} ${authorText}`);
      speechSynthesis.speak(utterance);
      showNotification('Speaking quote!');
  }

  function copyQuote() {
      const quoteText = `${quoteElement.textContent} ${authorElement.textContent}`;
      navigator.clipboard.writeText(quoteText)
          .then(() => showNotification('Quote copied!'))
          .catch(err => console.error('Copy error:', err));
  }

  function showLoadingSpinner(show) {
      loadingSpinner.classList.toggle('hidden', !show);
  }

  function showNotification(message) {
      notification.textContent = message;
      notification.classList.add('show');
      setTimeout(() => {
          notification.classList.remove('show');
      }, 2000);
  }

  newQuoteButton.addEventListener('click', fetchQuote);
  favoriteQuoteButton.addEventListener('click', saveFavorite);
  themeToggleButton.addEventListener('click', toggleTheme);
  speakQuoteButton.addEventListener('click', speakQuote);
  copyQuoteButton.addEventListener('click', copyQuote);

  // Fetch initial quote
  fetchQuote();
});
