// Assessment Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Range slider functionality
    const rangeSlider = document.getElementById('team_size');
    const rangeValue = document.getElementById('team_size_value');

    if (rangeSlider && rangeValue) {
        rangeSlider.addEventListener('input', function() {
            rangeValue.textContent = this.value + ' עובדים';
        });
    }

    // Auto-fill contact details from URL parameters
    fillContactDetailsFromURL();

    // Handle "other" checkbox functionality
    setupOtherCheckbox();
    setupOtherInfrastructureCheckbox();

    // Form submission
    const assessmentForm = document.getElementById('assessmentForm');
    if (assessmentForm) {
        assessmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const answers = {};
            
            // Collect form data
            for (let [key, value] of formData.entries()) {
                if (answers[key]) {
                    if (Array.isArray(answers[key])) {
                        answers[key].push(value);
                    } else {
                        answers[key] = [answers[key], value];
                    }
                } else {
                    answers[key] = value;
                }
            }

            // Analyze answers and determine solution
            const solution = analyzeAnswers(answers);
            
            // Display result
            displaySolution(solution);
            
            // Show result section
            const resultSection = document.getElementById('resultSection');
            if (resultSection) {
                resultSection.style.display = 'block';
                resultSection.scrollIntoView({ behavior: 'smooth' });
            }

            // Send data to webhook
            sendFormData(answers, solution);
        });
    }

    function setupOtherCheckbox() {
        const otherCheckbox = document.getElementById('task6');
        const otherTasksGroup = document.getElementById('other_tasks_group');
        
        if (otherCheckbox && otherTasksGroup) {
            otherCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    otherTasksGroup.style.display = 'block';
                    otherTasksGroup.querySelector('textarea').focus();
                } else {
                    otherTasksGroup.style.display = 'none';
                    otherTasksGroup.querySelector('textarea').value = '';
                }
            });
        }
    }

    function setupOtherInfrastructureCheckbox() {
        const otherInfrastructureCheckbox = document.getElementById('infra6');
        const otherInfrastructureGroup = document.getElementById('other_infrastructure_group');
        
        if (otherInfrastructureCheckbox && otherInfrastructureGroup) {
            otherInfrastructureCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    otherInfrastructureGroup.style.display = 'block';
                    otherInfrastructureGroup.querySelector('textarea').focus();
                } else {
                    otherInfrastructureGroup.style.display = 'none';
                    otherInfrastructureGroup.querySelector('textarea').value = '';
                }
            });
        }
    }

    function fillContactDetailsFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const contactFields = ['full_name', 'business_name', 'business_id', 'email', 'phone'];
        
        contactFields.forEach(field => {
            const value = urlParams.get(field);
            if (value) {
                const input = document.getElementById(field);
                if (input) {
                    input.value = decodeURIComponent(value);
                }
            }
        });
    }

    function analyzeAnswers(answers) {
        let score = 0;
        let complexity = 'basic';
        
        // Analyze automation tasks
        if (answers.automation_tasks) {
            const tasks = Array.isArray(answers.automation_tasks) ? answers.automation_tasks : [answers.automation_tasks];
            score += tasks.length * 10;
        }
        
        // Analyze problems
        if (answers.main_problems) {
            const problems = Array.isArray(answers.main_problems) ? answers.main_problems : [answers.main_problems];
            score += problems.length * 15;
        }
        
        // Analyze team size
        const teamSize = parseInt(answers.team_size) || 5;
        if (teamSize > 10) score += 20;
        else if (teamSize > 5) score += 10;
        
        // Analyze infrastructure
        if (answers.digital_infrastructure) {
            const infra = Array.isArray(answers.digital_infrastructure) ? answers.digital_infrastructure : [answers.digital_infrastructure];
            if (infra.includes('none')) score -= 10;
            else score += infra.length * 5;
        }

        // Analyze work process
        if (answers.work_process) {
            switch(answers.work_process) {
                case 'clear_process':
                    score += 15;
                    break;
                case 'somewhat_process':
                    score += 10;
                    break;
                case 'improvised':
                    score += 5;
                    break;
                case 'no_idea':
                    score += 0;
                    break;
            }
        }

        // Analyze timing
        if (answers.start_timing) {
            switch(answers.start_timing) {
                case 'next_week':
                    score += 20;
                    break;
                case 'this_month':
                    score += 15;
                    break;
                case 'next_quarter':
                    score += 10;
                    break;
                case 'just_checking':
                    score += 5;
                    break;
            }
        }
        
        // Determine solution type
        if (score >= 80) {
            complexity = 'advanced';
        } else if (score >= 50) {
            complexity = 'medium';
        } else {
            complexity = 'basic';
        }
        
        return {
            type: complexity,
            score: score,
            teamSize: teamSize,
            answers: answers
        };
    }

    function displaySolution(solution) {
        const solutionCard = document.getElementById('solutionCard');
        if (!solutionCard) return;
        
        let title, description, features, priceRange;
        
        switch(solution.type) {
            case 'basic':
                title = 'פתרון בסיסי - אוטומציה ממוקדת';
                description = 'פתרון מותאם למשימות ספציפיות שיחסוך לך זמן יקר ויאפשר לך להתמקד בגידול העסק.';
                features = [
                    'אוטומציה של משימה אחת או שתיים מרכזיות',
                    'הקמה מהירה תוך שבוע-שבועיים',
                    'תמיכה מלאה בהפעלה',
                    'מחיר נגיש ומותאם לעסקים קטנים'
                ];
                priceRange = '₪2,000-₪5,000';
                break;
                
            case 'medium':
                title = 'פתרון בינוני - חיבור מערכות';
                description = 'פתרון מקיף שיחבר בין המערכות השונות שלך וייצור תהליך עבודה חלק ויעיל.';
                features = [
                    'חיבור בין 2-3 מערכות מרכזיות',
                    'אוטומציה של מספר תהליכים במקביל',
                    'הקמה תוך 3-4 שבועות',
                    'ליווי מקצועי לאורך כל התהליך'
                ];
                priceRange = '₪5,000-₪12,000';
                break;
                
            case 'advanced':
                title = 'פתרון מתקדם - אוטומציה מלאה';
                description = 'פתרון מקיף ואינטגרטיבי שיהפוך את העסק שלך לחכם ויעיל יותר מאי פעם.';
                features = [
                    'אוטומציה מלאה של כל התהליכים',
                    'אינטגרציות מותאמות אישית',
                    'הקמה תוך 6-8 שבועות',
                    'ליווי אסטרטגי ותמיכה מתמשכת'
                ];
                priceRange = '₪12,000+';
                break;
        }
        
        solutionCard.innerHTML = `
            <h4>${title}</h4>
            <p>${description}</p>
            <ul style="margin-top: 1rem; padding-right: 1rem;">
                ${features.map(feature => `<li style="margin-bottom: 0.5rem;">${feature}</li>`).join('')}
            </ul>
            <p style="margin-top: 1rem; font-weight: 700; color: #8e52db;">
                נציג שלנו יצור איתך קשר בהקדם כדי לדבר על הפתרון המתאים ביותר!
            </p>
        `;
    }

    function sendFormData(answers, solution) {
        // Prepare data for webhook
        const webhookData = {
            contact_details: {
                full_name: answers.full_name,
                business_name: answers.business_name,
                business_id: answers.business_id,
                email: answers.email,
                phone: answers.phone
            },
            assessment_answers: {
                business_type: answers.business_type,
                automation_tasks: Array.isArray(answers.automation_tasks) ? answers.automation_tasks : [answers.automation_tasks],
                other_automation_tasks: answers.other_automation_tasks,
                main_problems: Array.isArray(answers.main_problems) ? answers.main_problems : [answers.main_problems],
                other_problems: answers.other_problems,
                digital_infrastructure: Array.isArray(answers.digital_infrastructure) ? answers.digital_infrastructure : [answers.digital_infrastructure],
                other_digital_infrastructure: answers.other_digital_infrastructure,
                team_size: answers.team_size,
                work_process: answers.work_process,
                start_timing: answers.start_timing
            },
            solution: {
                type: solution.type,
                score: solution.score,
                team_size: solution.teamSize,
                price_range: getPriceRange(solution.type)
            },
            timestamp: new Date().toISOString(),
            source: 'assessment_form'
        };

        // Send to webhook
        fetch('https://hook.eu2.make.com/l5jafipk98bfo1p7wxoj8jdcr90at97o', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData)
        })
        .then(response => {
            if (response.ok) {
                console.log('Data sent successfully to webhook');
                showSuccessMessage();
            } else {
                console.error('Failed to send data to webhook');
                showErrorMessage();
            }
        })
        .catch(error => {
            console.error('Error sending data to webhook:', error);
            showErrorMessage();
        });
    }

    function getPriceRange(solutionType) {
        switch(solutionType) {
            case 'basic':
                return '₪2,000-₪5,000';
            case 'medium':
                return '₪5,000-₪12,000';
            case 'advanced':
                return '₪12,000+';
            default:
                return 'לא נקבע';
        }
    }

    function showSuccessMessage() {
        // Add success message to the result section
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            const successMsg = document.createElement('div');
            successMsg.style.cssText = 'margin-top: 1rem; padding: 1rem; background: #f8f5ff; border-radius: 6px; border-right: 3px solid #8e52db;';
            successMsg.innerHTML = '<p style="margin: 0; color: #8e52db; font-weight: 700;">✓ הנתונים נשלחו בהצלחה! נציג יצור איתך קשר בהקדם.</p>';
            resultSection.appendChild(successMsg);
        }
    }

    function showErrorMessage() {
        // Add error message to the result section
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = 'margin-top: 1rem; padding: 1rem; background: #ffe6e6; border-radius: 6px; border-right: 3px solid #e91e63;';
            errorMsg.innerHTML = '<p style="margin: 0; color: #e91e63; font-weight: 700;">⚠️ הייתה בעיה בשליחת הנתונים. אנא נסה שוב או צור קשר ישירות.</p>';
            resultSection.appendChild(errorMsg);
        }
    }

    // Add smooth scrolling for better UX
    function smoothScrollTo(element) {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Add form validation
    function validateForm() {
        const requiredFields = document.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#e91e63';
                isValid = false;
            } else {
                field.style.borderColor = '#e0e0e0';
            }
        });

        return isValid;
    }

    // Add form validation on submit
    if (assessmentForm) {
        assessmentForm.addEventListener('submit', function(e) {
            if (!validateForm()) {
                e.preventDefault();
                alert('אנא מלא את כל השדות הנדרשים');
                return false;
            }
        });
    }
}); 