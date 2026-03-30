document.addEventListener('DOMContentLoaded', () => {
    // ---- Navigation / Tab Handling ----
    const navLinks = document.querySelectorAll('.nav-link');
    const tabViews = document.querySelectorAll('.tab-view');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetLink = e.currentTarget;
            const targetId = targetLink.getAttribute('data-target');
            console.log("Navigated to:", targetId);

            // Remove active classes
            navLinks.forEach(l => l.classList.remove('active'));
            tabViews.forEach(v => {
                v.classList.remove('active-view');
                v.classList.add('hidden-view');
            });

            // Add active class to clicked
            targetLink.classList.add('active');
            
            // Show target view
            const targetView = document.getElementById(targetId);
            if(targetView) {
                targetView.classList.remove('hidden-view');
                targetView.classList.add('active-view');
            } else {
                console.error("Could not find view element for ID:", targetId);
            }

            // Re-render FAQs if switching to setup view
            if(targetId === 'setup-view') {
                renderFaqs();
            }
        });
    });

    // ---- Form Handling ----
    const form = document.getElementById('support-form');
    const successMsg = document.getElementById('form-success');

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simulate form submission process
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Processing...</span>';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                successMsg.classList.remove('hidden');
                successMsg.style.opacity = '1';
                form.reset();
                
                setTimeout(() => {
                    successMsg.style.opacity = '0';
                    setTimeout(() => successMsg.classList.add('hidden'), 500);
                }, 5000);
            }, 1500);
        });
    }

    // ---- Chatbot Logic ----
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');
    const chatMessages = document.getElementById('chatbot-messages');

    // Toggle Chatbot Window
    const toggleChat = () => {
        chatbotWindow.classList.toggle('hidden');
        if (!chatbotWindow.classList.contains('hidden')) {
            chatInput.focus();
        }
    };

    chatbotToggle.addEventListener('click', toggleChat);
    chatbotClose.addEventListener('click', () => chatbotWindow.classList.add('hidden'));

    // AI Responses DB Concept (Now dynamically typed)
    let responses = [
        { 
            keywords: ['volunteer', 'help', 'join', 'participate'], 
            response: "Awesome! We love our volunteers. To join, please select 'Volunteer Registration' in the form securely located in the 'Support' tab. We'll reach out for an orientation." 
        },
        { 
            keywords: ['support', 'patient', 'need', 'care'], 
            response: "We provide telemedicine, mental health counseling, and personalized care routing. Use the form in the 'Support' tab to request assistance." 
        },
        { 
            keywords: ['contact', 'call', 'phone', 'email', 'number'], 
            response: "You can reach us directly at support@jaruratcare.example.com or call our hotline: 1-800-JARURAT-CARE." 
        },
        { 
            keywords: ['hi', 'hello', 'hey', 'greetings'], 
            response: "Hello there! I'm Jarurat Care AI. How can I assist you with your healthcare or volunteer inquiries today?" 
        },
        { 
            keywords: ['cost', 'price', 'pricing', 'fee', 'insurance'], 
            response: "Many of our basic support services are covered by insurance or offered free of charge. For specifics, please submit a 'General Inquiry' via the Support form." 
        },
        {
            keywords: ['thank', 'thanks', 'appreciate'],
            response: "You're very welcome! Let me know if you need anything else."
        }
    ];

    // ---- Setup View Logic ----
    const faqList = document.getElementById('faq-list');
    const addRuleBtn = document.getElementById('add-rule-btn');
    const newKeywordsInput = document.getElementById('new-keywords');
    const newResponseInput = document.getElementById('new-response');

    const renderFaqs = () => {
        if(!faqList) return;
        faqList.innerHTML = '';
        responses.forEach((rule, index) => {
            const ruleDiv = document.createElement('div');
            ruleDiv.className = 'rule-item';
            ruleDiv.innerHTML = `
                <button class="delete-rule" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                <strong>Keywords:</strong> ${rule.keywords.join(', ')}<br>
                <strong>Response:</strong> ${rule.response}
            `;
            faqList.appendChild(ruleDiv);
        });

        document.querySelectorAll('.delete-rule').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                responses.splice(idx, 1);
                renderFaqs();
            });
        });
    };

    if(addRuleBtn) {
        addRuleBtn.addEventListener('click', () => {
            const kws = newKeywordsInput.value.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
            const resp = newResponseInput.value.trim();
            if (kws.length > 0 && resp) {
                responses.push({ keywords: kws, response: resp });
                newKeywordsInput.value = '';
                newResponseInput.value = '';
                renderFaqs();
            } else {
                alert('Please enter both keywords and a response.');
            }
        });
    }

    // Initialize Setup UI on load if active
    renderFaqs();

    // Simple matching algorithm
    const generateResponse = (input) => {
        const lowerInput = input.toLowerCase();
        let matchedResponse = "I'm not completely sure about that. Please submit a 'General Inquiry' using the Support tab, and a human coordinator will get back to you soon.";
        
        for (const item of responses) {
            if (item.keywords.some(kw => lowerInput.includes(kw))) {
                matchedResponse = item.response;
                break;
            }
        }
        
        return matchedResponse;
    };

    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const showTypingIndicator = () => {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const removeTypingIndicator = () => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    };

    const handleSendMessage = () => {
        const text = chatInput.value.trim();
        if (text === '') return;

        addMessage(text, 'user');
        chatInput.value = '';

        showTypingIndicator(); // Simulate AI thinking
        const delay = Math.random() * 1500 + 1000;
        
        setTimeout(() => {
            removeTypingIndicator();
            const botResponse = generateResponse(text);
            addMessage(botResponse, 'bot');
        }, delay);
    };

    sendChatBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Auto-activate the first tab properly on initial load
    setTimeout(() => {
        const activeNav = document.querySelector('.nav-link.active');
        if (activeNav) {
            console.log("Auto-triggering active nav click...", activeNav.getAttribute('data-target'));
            activeNav.click();
        }
    }, 100);
});
