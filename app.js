(function main() {
  const converter = new Worker('/converter-worker.js');

  const postsAPI = 'https://srobertson421.builtwithdark.com';

  const baseAPI = 'https://pokeapi.co/api/v2/';
  const appEl = document.getElementById('app');
  const loader = document.querySelector('.p-loader');

  function toggleLoader(show) {
    if(show) {
      loader.style.display = 'block';
    } else {
      loader.style.display = 'none';
    }
  }

  function template(id, state = {}, returnNode) {
    const templateEl = document.getElementById(id);
    if(returnNode) {
      return templateEl.content.cloneNode(true);
    }

    const tempLiteral = eval(
      '`' + 
      Array.from(templateEl.content.children).map(c => {
        return c.outerHTML.replace('&gt;', '>').replace(/`/g,'\\`');
      }).join('\n') 
      + '`'
    );
    
    return tempLiteral;
  }

  const routes = [
    {
      path: '/',
      action: () => {
        return template('home-page');
      }
    },
    {
      path: '/about',
      action: () => {
        return template('about-page');
      }
    },
    {
      path: '/posts',
      action: async () => {
        const data = await fetch(`${postsAPI}/posts`)
        .then(res => res.json())
        .catch(err => console.log(err));

        console.log(data);

        return template('posts-page', data);
      }
    },
    {
      path: '/post/:id/:slug',
      action: async (context) => {
        const data = await fetch(`${postsAPI}/post/${context.params.id}`)
        .then(res => res.json())
        .catch(err => console.log(err));

        console.log(data);

        return template('post-view', data);
      }
    },
    {
      path: '/converter',
      action: () => {
        // const fragment = template('converter-page', {}, true);
        // fragment.querySelector('file-upload').addEventListener('change', e => {
        //   console.log('file changed');
        //   console.log(e);
        // });

        const test = document.createElement('h1');
        test.innerText = 'Hello there!';

        return test;
      }
    },
    {
      path: '/pokemon/page/:pageNum',
      action: async (context) => {
        toggleLoader(true);
        const pageNum = parseInt(context.params.pageNum);
        const data = await fetch(`${baseAPI}pokemon?limit=100${ pageNum > 1 ? `&offset=${(pageNum - 1) * 100}` : '' }`)
        .then(res => res.json())
        .catch(err => {
          toggleLoader(false);
          console.log(err);
        });

        toggleLoader(false);

        data.pageNum = pageNum;

        return template('pokemon-page', data);
      }
    },
    {
      path: '/pokemon/:id',
      action: async (context) => {
        toggleLoader(true);
        const pokeId = context.params.id;
        const data = await fetch(`${baseAPI}pokemon/${pokeId}`)
        .then(res => res.json())
        .catch(err => {
          toggleLoader(false);
          console.log(err);
        });

        toggleLoader(false);

        return template('pokemon-view', data);
      }
    }
  ];
  
  const router = new UniversalRouter(routes);

  function navigate(path) {
    router.resolve({ pathname: path || window.location.pathname }).then(result => {
      appEl.innerHTML = '';
      appEl.insertAdjacentHTML('afterbegin', result);
    });
  }

  window.onpopstate = function() {
    navigate();
  };

  navigate();

  // Global a tag overload
  document.body.addEventListener('click', e => {
    if(e.target.tagName.toLowerCase() === 'a') {
      e.preventDefault();
      const path = e.target.getAttribute('href');
      window.history.pushState({}, '', path);
      navigate(path);
    }
  });
})()