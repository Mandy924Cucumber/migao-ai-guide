const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeLabel = document.querySelector("[data-theme-label]");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const header = document.querySelector("[data-header]");

const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
let savedTheme = null;

try {
  savedTheme = localStorage.getItem("ai-guide-theme");
} catch {
  savedTheme = null;
}
const initialTheme = savedTheme || (systemPrefersLight ? "light" : "dark");

function applyTheme(theme) {
  root.dataset.theme = theme;
  const nextTheme = theme === "dark" ? "light" : "dark";
  const nextLabel = nextTheme === "light" ? "浅色" : "深色";
  themeLabel.textContent = nextLabel;
  themeToggle.setAttribute("aria-label", `切换到${nextLabel}模式`);
  document.querySelector('meta[name="theme-color"]').content =
    theme === "dark" ? "#111310" : "#e9ece4";
}

applyTheme(initialTheme);

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("ai-guide-theme", nextTheme);
  } catch {
    /* The theme still changes when storage is unavailable. */
  }
  applyTheme(nextTheme);
});

menuToggle.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "关闭" : "菜单";
});

navigation.addEventListener("click", (event) => {
  if (!event.target.matches("a")) return;
  navigation.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "菜单";
});

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".site-nav a");

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.hash === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-30% 0px -55%", threshold: 0 }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const headerSentinel = document.querySelector(".premise");
  const headerObserver = new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-scrolled", entry.boundingClientRect.top < 72);
  });

  headerObserver.observe(headerSentinel);
}

const promptForm = document.querySelector("#prompt-form");
const taskInput = document.querySelector("#task-input");
const audienceInput = document.querySelector("#audience-input");
const formatInput = document.querySelector("#format-input");
const promptResult = document.querySelector("#prompt-result");
const formError = document.querySelector(".form-error");
const generateButton = document.querySelector(".generate-button");
const copyButton = document.querySelector(".copy-button");
const resetButton = document.querySelector(".lab-reset");

promptForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const task = taskInput.value.trim();

  if (!task) {
    formError.hidden = false;
    taskInput.setAttribute("aria-invalid", "true");
    taskInput.focus();
    return;
  }

  formError.hidden = true;
  taskInput.removeAttribute("aria-invalid");
  generateButton.disabled = true;
  generateButton.textContent = "正在整理";

  window.setTimeout(() => {
    const audience = audienceInput.value.trim();
    const format = formatInput.value.trim();
    const parts = [`请帮我${task}`];

    if (audience) parts.push(`内容面向${audience}`);
    if (format) parts.push(`输出要求：${format}`);
    parts.push("请先列出你的理解与计划，再给出结果；对不确定的信息请明确说明。");

    promptResult.textContent = `${parts.join("。 ")}`;
    generateButton.disabled = false;
    generateButton.textContent = "生成提示词";
    copyButton.disabled = false;
  }, 420);
});

taskInput.addEventListener("input", () => {
  if (!taskInput.value.trim()) return;
  formError.hidden = true;
  taskInput.removeAttribute("aria-invalid");
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(promptResult.textContent);
    copyButton.textContent = "已复制";
    window.setTimeout(() => {
      copyButton.textContent = "复制";
    }, 1400);
  } catch {
    copyButton.textContent = "请手动复制";
  }
});

resetButton.addEventListener("click", () => {
  promptForm.reset();
  formError.hidden = true;
  taskInput.removeAttribute("aria-invalid");
  promptResult.textContent = "填写左侧信息，这里会组合出一条更清楚的提示词。";
  copyButton.disabled = true;
  copyButton.textContent = "复制";
  taskInput.focus();
});
