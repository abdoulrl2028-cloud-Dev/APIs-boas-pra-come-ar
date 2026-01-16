const app = {
    // Configurações das APIs
    apiEndpoints: {
        jsonplaceholder: 'https://jsonplaceholder.typicode.com',
        pokeapi: 'https://pokeapi.co/api/v2',
        openweather: 'https://api.open-meteo.com/v1'
    },

    // Inicializar a aplicação
    init() {
        this.setupTabs();
        this.setupEventListeners();
        console.log('✅ Aplicação inicializada');
    },

    // Configurar tabs
    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                
                // Remover active de todos os botões e conteúdos
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));
                
                // Adicionar active ao clicado
                btn.classList.add('active');
                document.getElementById(tabName).classList.add('active');
            });
        });
    },

    // Configurar event listeners adicionais
    setupEventListeners() {
        // Buscar post ao pressionar Enter
        document.getElementById('postId')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.fetchPost();
        });

        // Buscar pokémon ao pressionar Enter
        document.getElementById('pokemonName')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.fetchPokemon();
        });

        // Buscar clima ao pressionar Enter
        document.getElementById('cityName')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.fetchWeather();
        });

        // Filtro de usuários
        document.getElementById('searchUsers')?.addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });
    },

    // Mostrar loading
    showLoading(container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Carregando...</p>
            </div>
        `;
    },

    // Mostrar erro
    showError(container, message) {
        container.innerHTML = `<div class="error">❌ Erro: ${message}</div>`;
    },

    // =========================
    // JSONPlaceholder - Posts
    // =========================
    async fetchPost() {
        const postId = document.getElementById('postId').value;
        const container = document.getElementById('posts-container');
        
        if (!postId || postId < 1 || postId > 100) {
            this.showError(container, 'Digite um ID entre 1 e 100');
            return;
        }

        this.showLoading(container);

        try {
            const response = await fetch(`${this.apiEndpoints.jsonplaceholder}/posts/${postId}`);
            if (!response.ok) throw new Error('Post não encontrado');
            
            const post = await response.json();
            const user = await fetch(`${this.apiEndpoints.jsonplaceholder}/users/${post.userId}`).then(r => r.json());
            
            container.innerHTML = this.createPostCard(post, user);
        } catch (error) {
            this.showError(container, error.message);
        }
    },

    async fetchAllPosts() {
        const container = document.getElementById('posts-container');
        this.showLoading(container);

        try {
            const response = await fetch(`${this.apiEndpoints.jsonplaceholder}/posts?_limit=5`);
            const posts = await response.json();
            
            let html = '<h3>Últimos 5 Posts</h3>';
            for (const post of posts) {
                const user = await fetch(`${this.apiEndpoints.jsonplaceholder}/users/${post.userId}`).then(r => r.json());
                html += this.createPostCard(post, user);
            }
            
            container.innerHTML = html;
        } catch (error) {
            this.showError(container, error.message);
        }
    },

    createPostCard(post, user) {
        return `
            <div class="card">
                <div class="card-title">📝 ${post.title}</div>
                <div class="card-text">${post.body}</div>
                <div class="card-info">
                    <div class="info-item">
                        <span class="info-label">Autor</span>
                        <strong>${user.name}</strong>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email</span>
                        ${user.email}
                    </div>
                    <div class="info-item">
                        <span class="info-label">ID do Post</span>
                        #${post.id}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Usuário ID</span>
                        #${post.userId}
                    </div>
                </div>
            </div>
        `;
    },

    // =========================
    // JSONPlaceholder - Users
    // =========================
    allUsers = [],

    async fetchAllUsers() {
        const container = document.getElementById('users-container');
        this.showLoading(container);

        try {
            const response = await fetch(`${this.apiEndpoints.jsonplaceholder}/users`);
            this.allUsers = await response.json();
            this.displayUsers(this.allUsers);
        } catch (error) {
            this.showError(container, error.message);
        }
    },

    displayUsers(users) {
        const container = document.getElementById('users-container');
        let html = `<h3>Total: ${users.length} usuários</h3>`;
        
        users.forEach(user => {
            html += `
                <div class="card">
                    <div class="card-title">👤 ${user.name}</div>
                    <div class="card-info">
                        <div class="info-item">
                            <span class="info-label">Email</span>
                            ${user.email}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Telefone</span>
                            ${user.phone}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Website</span>
                            ${user.website}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Empresa</span>
                            ${user.company.name}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Cidade</span>
                            ${user.address.city}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Username</span>
                            @${user.username}
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },

    filterUsers(searchTerm) {
        const filtered = this.allUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.displayUsers(filtered);
    },

    // =========================
    // PokeAPI - Pokémon
    // =========================
    async fetchPokemon() {
        const pokemonName = document.getElementById('pokemonName').value.toLowerCase().trim();
        const container = document.getElementById('pokemon-container');

        if (!pokemonName) {
            this.showError(container, 'Digite o nome ou ID de um pokémon');
            return;
        }

        this.showLoading(container);

        try {
            const response = await fetch(`${this.apiEndpoints.pokeapi}/pokemon/${pokemonName}`);
            if (!response.ok) throw new Error('Pokémon não encontrado');
            
            const pokemon = await response.json();
            container.innerHTML = this.createPokemonCard(pokemon);
        } catch (error) {
            this.showError(container, error.message);
        }
    },

    async fetchRandomPokemon() {
        const randomId = Math.floor(Math.random() * 1025) + 1;
        document.getElementById('pokemonName').value = randomId;
        this.fetchPokemon();
    },

    createPokemonCard(pokemon) {
        const types = pokemon.types.map(t => t.type.name).join(', ');
        const abilities = pokemon.abilities.map(a => a.ability.name).join(', ');
        
        let statsHtml = '';
        pokemon.stats.forEach(stat => {
            const percentage = (stat.base_stat / 255) * 100;
            statsHtml += `
                <div class="stat-bar">
                    <div class="stat-name">${stat.stat.name.toUpperCase()}</div>
                    <div class="stat-value">
                        <span>${stat.base_stat}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        return `
            <div class="card pokemon-card">
                <div class="pokemon-image">
                    <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                         alt="${pokemon.name}">
                    <p style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #999;">
                        #${pokemon.id.toString().padStart(4, '0')}
                    </p>
                </div>
                <div class="pokemon-stats">
                    <div class="card-title">⚡ ${pokemon.name.toUpperCase()}</div>
                    <div class="card-info">
                        <div class="info-item">
                            <span class="info-label">Tipos</span>
                            ${types}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Altura</span>
                            ${(pokemon.height / 10).toFixed(1)} m
                        </div>
                        <div class="info-item">
                            <span class="info-label">Peso</span>
                            ${(pokemon.weight / 10).toFixed(1)} kg
                        </div>
                        <div class="info-item">
                            <span class="info-label">Habilidades</span>
                            ${abilities}
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        <h4 style="margin-bottom: 10px; color: #667eea;">Stats</h4>
                        <div class="stats-list">
                            ${statsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // =========================
    // OpenWeather - Clima
    // =========================
    async fetchWeather() {
        const cityName = document.getElementById('cityName').value.trim();
        const container = document.getElementById('weather-container');

        if (!cityName) {
            this.showError(container, 'Digite o nome de uma cidade');
            return;
        }

        this.showLoading(container);

        try {
            // Primeiro, obter coordenadas da cidade
            const geoResponse = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt&format=json`
            );
            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                throw new Error('Cidade não encontrada');
            }

            const result = geoData.results[0];
            const { latitude, longitude, name, country } = result;

            // Depois, obter dados de clima
            const weatherResponse = await fetch(
                `${this.apiEndpoints.openweather}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&temperature_unit=celsius&timezone=auto&language=pt`
            );
            const weatherData = await weatherResponse.json();

            container.innerHTML = this.createWeatherCard(weatherData.current, name, country);
        } catch (error) {
            this.showError(container, error.message);
        }
    },

    createWeatherCard(weather, city, country) {
        const weatherDescriptions = {
            0: '☀️ Céu limpo',
            1: '🌤️ Principalmente claro',
            2: '⛅ Parcialmente nublado',
            3: '☁️ Nublado',
            45: '🌫️ Nevoeiro',
            48: '🌫️ Nevoeiro gelado',
            51: '🌧️ Leve chuva',
            61: '🌧️ Chuva',
            71: '❄️ Neve leve',
            80: '⛈️ Chuva forte',
            95: '⛈️ Tempestade'
        };

        const description = weatherDescriptions[weather.weather_code] || '🌡️ Variável';

        return `
            <div class="card weather-card">
                <h3 style="margin-bottom: 10px;">📍 ${city}, ${country}</h3>
                <div class="weather-main">${description}</div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <span class="weather-label">🌡️ Temperatura</span>
                        <div class="weather-value">${weather.temperature_2m}°C</div>
                    </div>
                    <div class="weather-detail">
                        <span class="weather-label">💨 Velocidade do Vento</span>
                        <div class="weather-value">${weather.wind_speed_10m} km/h</div>
                    </div>
                    <div class="weather-detail">
                        <span class="weather-label">💧 Umidade</span>
                        <div class="weather-value">${weather.relative_humidity_2m}%</div>
                    </div>
                    <div class="weather-detail">
                        <span class="weather-label">🕐 Hora UTC</span>
                        <div class="weather-value">${new Date(weather.time).toLocaleTimeString()}</div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
