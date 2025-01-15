// 代码块copy按钮功能
document.addEventListener('DOMContentLoaded', function () {
    // 获取所有的 pre 代码块
    const preElements = document.querySelectorAll('pre');

    // 使用事件委托，减少事件监听器的数量
    document.body.addEventListener('click', function (event) {
        if (event.target.classList.contains('copy-button')) {
            const button = event.target;
            const codeText = button.getAttribute('data-code');

            // 兼容性检查
            if (navigator.clipboard && navigator.clipboard.writeText) {
                // 使用现代 Clipboard API
                navigator.clipboard.writeText(codeText).then(() => {
                    showSuccess(button);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    showError(button);
                });
            } else {
                // 使用备用方法：创建一个临时的 textarea 元素
                const textarea = document.createElement('textarea');
                textarea.value = codeText;
                textarea.style.position = 'fixed'; // 避免滚动到底部
                document.body.appendChild(textarea);
                textarea.select();

                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        showSuccess(button);
                    } else {
                        showError(button);
                    }
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    showError(button);
                } finally {
                    document.body.removeChild(textarea); // 移除临时元素
                }
            }
        }
    });

    // 遍历所有 pre 元素，插入复制按钮
    preElements.forEach(pre => {
        const codeElement = pre.querySelector('code');
        const codeText = codeElement ? codeElement.textContent : '';
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.classList.add('copy-button'); 
        copyButton.setAttribute('data-code', codeText); 
        copyButton.style.position = 'absolute';
        copyButton.style.top = '-10px';
        copyButton.style.right = '15px';
        copyButton.style.backgroundColor = '#007bff';
        copyButton.style.color = '#fff';
        copyButton.style.border = 'none';
        copyButton.style.padding = '4px 8px';
        copyButton.style.borderRadius = '4px';
        copyButton.style.cursor = 'pointer';
        copyButton.style.fontSize = '0.9em';
        copyButton.style.transition = 'background-color 0.3s ease';
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.marginBottom = '10px';
        container.appendChild(copyButton);
        pre.parentNode.insertBefore(container, pre);
    });
});

function showSuccess(button) {
    button.textContent = 'Success!';
    button.style.backgroundColor = '#28a745'; 
    setTimeout(() => {
        button.textContent = 'Copy';
        button.style.backgroundColor = '#007bff';
    }, 2000);
}

// 显示复制失败的提示
function showError(button) {
    button.textContent = 'Failed';
    button.style.backgroundColor = '#dc3545';
    setTimeout(() => {
        button.textContent = 'Copy';
        button.style.backgroundColor = '#007bff'; 
    }, 2000);
}

// 处理点赞按钮点击事件
const UpvoteManager = (group, plural) => {
  const STORAGE_KEY = `anatole.upvoted.${group}.names`;

  return {
    upvotedNames: [],
    init() {
      // 从 localStorage 中加载已点赞的名称
      this.upvotedNames = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    },
    upvoted(name) {
      // 检查是否已经点赞
      return this.upvotedNames.includes(name);
    },
    async handleUpvote(name) {
      if (this.upvoted(name)) return; // 如果已经点赞，直接返回

      try {
        const response = await fetch("/apis/api.halo.run/v1alpha1/trackers/upvote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            group,
            plural,
            name,
          }),
        });

        if (!response.ok) {
          throw new Error("网络请求失败");
        }

        // 更新本地存储和 UI
        this.upvotedNames = [...this.upvotedNames, name];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.upvotedNames));

        const upvoteElement = document.querySelector(`[data="${name}"] span`);
        if (upvoteElement) {
          const currentCount = parseInt(upvoteElement.textContent || "0");
          upvoteElement.textContent = currentCount + 1;
        }
      } catch (error) {
        console.error("点赞失败:", error);
        alert("网络请求失败，请稍后再试");
      }
    },
  };
};

// 初始化点赞管理器
const momentUpvoteManager = UpvoteManager("moment.halo.run", "moments");
const postUpvoteManager = UpvoteManager("content.halo.run", "posts");
const pageUpvoteManager = UpvoteManager("content.halo.run", "singlepages");

momentUpvoteManager.init();
postUpvoteManager.init();
pageUpvoteManager.init();

// 绑定点赞按钮点击事件
document.addEventListener("DOMContentLoaded", () => {
  const likeButtons = document.querySelectorAll(".like-btn");

  likeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const name = button.getAttribute("data");
      const type = button.getAttribute("data-type"); // 获取点赞类型
      
      // 根据类型调用对应的点赞管理器
      if (type === "moment") {
        momentUpvoteManager.handleUpvote(name);
      } else if (type === "content") {
        postUpvoteManager.handleUpvote(name);
      } else if (type === "singlepages") {
        pageUpvoteManager.handleUpvote(name);
      }
    });
  });
});

// 瞬间评论功能
document.addEventListener('DOMContentLoaded', function () {
  const commentButtons = document.querySelectorAll('.comment-btn');

  commentButtons.forEach(btn => {
      btn.addEventListener('click', function () {
          const momentName = this.dataset.moment;
          const commentsSection = document.getElementById(`comments-${momentName}`);

          // 检查评论区域是否存在
          if (!commentsSection) {
              console.error(`Comments section with ID "comments-${momentName}" not found.`);
              return;
          }

          // 获取当前显示状态
          const displayStyle = window.getComputedStyle(commentsSection).display;

          // 切换显示状态
          if (displayStyle === 'none') {
              commentsSection.style.display = 'block';
              this.classList.add('active');
          } else {
              commentsSection.style.display = 'none';
              this.classList.remove('active');
          }
      });
  });
});