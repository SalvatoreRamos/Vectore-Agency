// ============================================
// VECTORE GLOBAL — Smart Qualifying Form
// Multi-step form that pre-qualifies leads
// ============================================

export function initSmartForm() {
    const form = document.getElementById('smartForm');
    if (!form) return;

    const steps = form.querySelectorAll('.form-step');
    const progressSteps = form.querySelectorAll('.form-progress__step');
    const progressBar = form.querySelector('.form-progress__bar');
    const successEl = document.getElementById('formSuccess');

    let currentStep = 0;
    const totalSteps = steps.length;

    // Form data
    const formData = {
        service: '',
        timeline: '',
        budget: '',
        name: '',
        email: '',
        company: '',
        description: ''
    };

    // Show step
    function showStep(index) {
        steps.forEach((step, i) => {
            step.classList.toggle('active', i === index);
        });

        progressSteps.forEach((step, i) => {
            step.classList.toggle('active', i === index);
            step.classList.toggle('completed', i < index);
        });

        if (progressBar) {
            const progress = (index / (totalSteps - 1)) * 100;
            progressBar.style.width = `${progress}%`;
        }

        currentStep = index;
    }

    // Handle option selection (Steps 1-3)
    form.querySelectorAll('.form-option').forEach(option => {
        option.addEventListener('click', () => {
            const step = option.closest('.form-step');
            const key = step.getAttribute('data-field');
            const value = option.getAttribute('data-value');

            // Deselect siblings
            step.querySelectorAll('.form-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            // Store value
            formData[key] = value;

            // Auto-advance after short delay
            setTimeout(() => {
                if (currentStep < totalSteps - 1) {
                    showStep(currentStep + 1);
                }
            }, 300);
        });
    });

    // Back button
    form.querySelectorAll('.form-nav__back').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 0) {
                showStep(currentStep - 1);
            }
        });
    });

    // Final submit
    const submitBtn = form.querySelector('.form-submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            // Collect text inputs
            const nameInput = form.querySelector('#contactName');
            const emailInput = form.querySelector('#contactEmail');
            const companyInput = form.querySelector('#contactCompany');
            const descInput = form.querySelector('#contactDescription');

            if (nameInput) formData.name = nameInput.value.trim();
            if (emailInput) formData.email = emailInput.value.trim();
            if (companyInput) formData.company = companyInput.value.trim();
            if (descInput) formData.description = descInput.value.trim();

            // Basic validation
            if (!formData.name || !formData.email) {
                emailInput?.focus();
                return;
            }

            // Disable button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                const response = await fetch('/api/contact/qualify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    // Show success
                    form.style.display = 'none';
                    if (successEl) successEl.style.display = 'block';

                    // Track conversion
                    if (typeof gtag === 'function') {
                        gtag('event', 'form_qualified', {
                            event_category: 'Lead',
                            event_label: formData.service,
                            value: formData.budget
                        });
                    }
                } else {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message →';
                    alert(result.message || 'Something went wrong. Please try again.');
                }
            } catch (error) {
                console.error('Form submit error:', error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message →';
            }
        });
    }

    // Initialize first step
    showStep(0);
}
