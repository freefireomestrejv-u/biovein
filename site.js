// BIOVEIN â€” URL Ãºnica de checkout + interaÃ§Ãµes leves
const CHECKOUT_URL = "#ofertas"; // botoes comuns rolam para as ofertas; kits tem link proprio do Payt

document.addEventListener("DOMContentLoaded", () => {
  // Todos os CTAs apontam para a variÃ¡vel Ãºnica
  if (!window.requestAnimationFrame) { window.requestAnimationFrame = function (f) { return setTimeout(f, 16); }; }
  window.addEventListener("error", function (e) { if (window.console && console.error) console.error("[biovein]", e.message); });
  window.addEventListener("unhandledrejection", function (e) { if (window.console && console.error) console.error("[biovein]", e.reason); });

  document.querySelectorAll("[data-checkout]").forEach((a) => {
    a.setAttribute("href", CHECKOUT_URL);
  });
  document.querySelectorAll("[data-kit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kit = btn.getAttribute("data-kit");
      const sel = document.querySelector("#kit");
      if (sel && kit) sel.value = kit;
    });
  });

  const reduzidoGlobal = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const temGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  if (temGsap) gsap.registerPlugin(ScrollTrigger);

  // Entrada por rolagem: GSAP (entra e sai) ou fallback com IntersectionObserver (sÃ³ entra)
  if (temGsap && !reduzidoGlobal) {
    // Cada .reveal anima ao entrar e REVERTE ao sair (scroll in/out)
    document.querySelectorAll(".reveal").forEach((el) => {
      const demora = parseFloat(getComputedStyle(el).transitionDelay) || 0;
      gsap.fromTo(
        el,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          delay: Math.min(demora, 0.5),
          ease: "power2.out",
          overwrite: "auto",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
        }
      );
    });
    // Hero: sequÃªncia de abertura (selo, tÃ­tulo, subtÃ­tulo, texto, botÃ£o)
    const alvosHero = document.querySelectorAll(".hero-conteudo > div > *");
    if (alvosHero.length) {
      gsap.from(alvosHero, { opacity: 0, y: 34, duration: 0.45, ease: 'power3.out', stagger: 0.06, delay: 0.05 });
    }
    // Parallax sutil no fundo do hero (sobe mais devagar que o texto)
    const fundoHero = document.querySelector(".hero-bg");
    if (fundoHero) {
      gsap.to(fundoHero, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });
    }
    // Pote da composiÃ§Ã£o: flutuaÃ§Ã£o suave contÃ­nua + giro leve com a rolagem
    // (composicao: pote estatico, sem animacoes)
    // TÃ­tulos de seÃ§Ã£o: leve subida com a rolagem (efeito de profundidade)
    document.querySelectorAll("section:not(.comp) h2").forEach((h2) => {
      gsap.fromTo(
        h2,
        { y: 18 },
        { y: -10, ease: "none", scrollTrigger: { trigger: h2, start: "top bottom", end: "bottom top", scrub: 1.2 } }
      );
    });
  } else if ("IntersectionObserver" in window) {
    // AnimaÃ§Ã£o discreta de entrada (uma Ãºnica vez)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visivel");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visivel"));
  }
  setTimeout(() => {
    document.querySelectorAll(".reveal:not(.visivel)").forEach((el) => el.classList.add("visivel"));
  }, 2500);

  // Lightbox: imagens (depoimentos futuros) + anexos do carrossel (img/vÃ­deo)
  const lb = document.querySelector("#lightbox");
  const lbImg = lb ? lb.querySelector(".lb-img") : null;
  const lbVideo = lb ? lb.querySelector("video") : null;
  const fecharLb = () => {
    if (!lb) return;
    lb.classList.remove("aberto", "video");
    if (lbVideo) {
      lbVideo.pause();
      lbVideo.removeAttribute("src");
      lbVideo.load();
    }
  };
  const abrirLb = (tipo, src, alt) => {
    if (!lb) return;
    const erro = lb.querySelector(".lb-erro");
    if (erro) erro.hidden = true;
    if (tipo === "video" && lbVideo) {
      lb.classList.add("aberto", "video");
      lbVideo.src = src;
      lbVideo.play().catch(() => {});
    } else if (lbImg) {
      lb.classList.add("aberto");
      lbImg.src = src;
      lbImg.alt = alt || "";
    }
  };
  if (lbVideo) {
    lbVideo.addEventListener("error", () => {
      const erro = lb.querySelector(".lb-erro");
      if (erro) erro.hidden = false;
    });
  }
  // BotÃ£o "Assistir apresentaÃ§Ã£o" (vÃ­deo do doutor, quando enviado)
  document.querySelectorAll("[data-video-src]").forEach((btn) => {
    btn.addEventListener("click", () => abrirLb("video", btn.getAttribute("data-video-src"), "ApresentaÃ§Ã£o do doutor"));
  });
  document.querySelectorAll("[data-ampliar]").forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => abrirLb("img", img.src, img.alt));
  });
  document.querySelectorAll("[data-midia]").forEach((item) => {
    const vai = () => abrirLb(item.getAttribute("data-midia"), item.getAttribute("data-src"), item.getAttribute("aria-label") || "");
    item.addEventListener("click", vai);
    item.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        vai();
      }
    });
  });
  if (lb) {
    lb.addEventListener("click", fecharLb);
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") fecharLb();
    });
  }

  if (lb) {
    lb.addEventListener("click", fecharLb);
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") fecharLb();
    });
  }

  // Coverflow de depoimentos: loop por mÃ³dulo, autoplay 3.8s, swipe, dots, vÃ­deo sÃ³ no centro
  const cf = document.querySelector("#coverflow");
  const cfPalco = document.querySelector("#cfPalco");
  if (cf && cfPalco) {
    cf.classList.add("cf-espera"); // esconde sÃ³ com JS ativo; revela no 1Âº frame posicionado
    const slides = Array.from(cfPalco.querySelectorAll(".cf-slide"));
    const conta = slides.length;
    const dotsBox = cf.querySelector(".cf-dots");
    const reduzido = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ehMobile = () => window.matchMedia && matchMedia("(max-width: 768px)").matches;
    let ativo = 0, timerAuto = null, timerRetoma = null, sobre = false, arrastando = false;

    const dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Ir para o item " + (i + 1) + " de " + conta);
      b.addEventListener("click", () => {
        irPara(i);
        interagiu();
      });
      dotsBox.appendChild(b);
      return b;
    });

    const pausarVideos = () => {
      slides.forEach((s) => {
        const v = s.querySelector("video");
        if (v) {
          v.pause();
          v.removeAttribute("controls");
          try {
            v.currentTime = 0;
          } catch (e) {}
        }
      });
    };

    // Offset circular: menor distÃ¢ncia entre Ã­ndices (foco sempre no centro)
    const lado = (i, a) => {
      let o = (((i - a) % conta) + conta) % conta;
      if (o > conta / 2) o -= conta;
      return o;
    };

    const aplicar = () => {
      const mobile = ehMobile();
      slides.forEach((s, i) => {
        const off = lado(i, ativo);
        const a = Math.abs(off);
        const esc = a === 0 ? 1 : a === 1 ? 0.82 : a === 2 ? 0.66 : 0.5;
        const opa = a === 0 ? 1 : a === 1 ? 0.85 : a === 2 ? 0.6 : 0.35;
        const some = mobile && a > 1;
        // Passo a partir das larguras reais escaladas + gap (lado a lado, sem sobrepor)
        const W = slides[0].offsetWidth || 300;
        const gap = mobile ? 16 : 24;
        const xs = [0, W * 0.91 + gap, W * 0.91 + gap + W * 0.74 + gap, W * 0.91 + gap + W * 0.74 + gap + W * 0.58 + gap];
        s.style.transform = "translate(-50%,-50%) translateX(" + off * xs[a] + "px) scale(" + esc + ")";
        s.style.opacity = some ? "0" : String(opa);
        s.style.zIndex = String(20 - a);
        s.style.filter = "none";
        s.style.visibility = some ? "hidden" : "visible";
        s.style.pointerEvents = some ? "none" : "auto";
        s.classList.toggle("ativo", off === 0);
        s.setAttribute("aria-hidden", off === 0 ? "false" : "true");
        s.tabIndex = off === 0 ? 0 : -1;
        const play = s.querySelector(".cf-play");
        if (play) play.style.display = off === 0 ? "grid" : "none";
        dots[i].classList.toggle("on", off === 0);
        if (off === 0) dots[i].setAttribute("aria-current", "true");
        else dots[i].removeAttribute("aria-current");
      });
    };

    const irPara = (i) => {
      pausarVideos();
      const novo = (((i % conta) + conta) % conta);
      // Itens que cruzam de um extremo ao outro trocam sem transiÃ§Ã£o (jÃ¡ distantes)
      slides.forEach((s, k) => {
        const antes = lado(k, ativo);
        const depois = lado(k, novo);
        if (Math.abs(antes) >= 3 && Math.abs(depois) >= 3 && Math.sign(antes) !== Math.sign(depois)) {
          s.classList.add("sem-transicao");
        }
      });
      void cf.offsetWidth;
      ativo = novo;
      aplicar();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        slides.forEach((s) => s.classList.remove("sem-transicao"));
      }));
    };

    const videoTocando = () => slides.some((s) => {
      const v = s.querySelector("video");
      return v && !v.paused && !v.ended;
    });
    const limparAuto = () => {
      if (timerAuto) {
        clearInterval(timerAuto);
        timerAuto = null;
      }
    };
    const iniciarAuto = () => {
      limparAuto();
      if (reduzido) return;
      timerAuto = setInterval(() => {
        if (!reduzido && !document.hidden && !videoTocando() && !sobre && !arrastando) {
          irPara(ativo + 1);
        }
      }, 1100);
    };
    const interagiu = () => {
      limparAuto();
      clearTimeout(timerRetoma);
      timerRetoma = setTimeout(iniciarAuto, 3000);
    };

    cf.querySelector(".cf-prox").addEventListener("click", () => {
      irPara(ativo + 1);
      interagiu();
    });
    cf.querySelector(".cf-ant").addEventListener("click", () => {
      irPara(ativo - 1);
      interagiu();
    });
    cf.addEventListener("mouseenter", () => {
      sobre = true;
    });
    cf.addEventListener("mouseleave", () => {
      sobre = false;
    });
    cf.addEventListener("focusin", () => {
      sobre = true;
    });
    cf.addEventListener("focusout", () => {
      sobre = false;
    });
    cf.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowRight") {
        irPara(ativo + 1);
        interagiu();
      } else if (ev.key === "ArrowLeft") {
        irPara(ativo - 1);
        interagiu();
      }
    });

    // Swipe (mouse + toque): limiar de 50px
    let x0 = null;
    cfPalco.addEventListener("pointerdown", (ev) => {
      arrastando = true;
      x0 = ev.clientX;
    });
    window.addEventListener("pointerup", (ev) => {
      if (!arrastando || x0 === null) return;
      arrastando = false;
      const dx = ev.clientX - x0;
      x0 = null;
      if (dx <= -50) {
        irPara(ativo + 1);
        interagiu();
      } else if (dx >= 50) {
        irPara(ativo - 1);
        interagiu();
      }
    });

    // Clique: lateral vai ao centro; centro com vÃ­deo toca; centro com imagem abre lightbox
    cfPalco.addEventListener("click", (ev) => {
      const play = ev.target.closest(".cf-play");
      const slide = ev.target.closest(".cf-slide");
      if (!slide) return;
      const idx = slides.indexOf(slide);
      if (idx !== ativo) {
        irPara(idx);
        interagiu();
        return;
      }
      if (play) {
        const v = slide.querySelector("video");
        if (v) {
          v.setAttribute("controls", "");
          v.play().catch(() => {});
        }
        return;
      }
      if (slide.getAttribute("data-tipo") === "img") {
        abrirLb("img", slide.getAttribute("data-src"), slide.querySelector("img").alt);
      }
    });

    // Autoplay pausa com vÃ­deo tocando e retoma ao pausar/terminar
    slides.forEach((s) => {
      const v = s.querySelector("video");
      if (!v) return;
      const play = s.querySelector(".cf-play");
      const esconderPlay = () => {
        s.classList.add("tocando");
        if (play) play.style.display = "none";
      };
      const mostrarPlay = () => {
        s.classList.remove("tocando");
        if (play && s.classList.contains("ativo")) play.style.display = "grid";
      };
      v.addEventListener("play", () => {
        limparAuto();
        esconderPlay();
      });
      v.addEventListener("pause", () => {
        mostrarPlay();
        interagiu();
      });
      v.addEventListener("ended", () => {
        mostrarPlay();
        interagiu();
      });
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) limparAuto();
      else interagiu();
    });
    let resizeTimer = null;
    const aoMudarTamanho = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(aplicar, 150);
    };
    window.addEventListener("resize", aoMudarTamanho);
    window.addEventListener("orientationchange", aoMudarTamanho);

    // Primeira pintura jÃ¡ posicionada; revela sÃ³ depois (sem flash quebrado)
    cf.classList.add("cf-ligado");
    aplicar();
    requestAnimationFrame(() => {
      aplicar();
      cf.classList.remove("cf-espera");
      cf.classList.add("pronto");
      iniciarAuto();
    });
  }
});

