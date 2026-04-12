---
layout: page
title: Chess Lessons
permalink: /chess-lessons/
---

<div class="lessons-stats">
  <div class="stat-card">
    <span class="stat-number" data-target="91">0</span>
    <span class="stat-label">Students Taught</span>
  </div>
  <div class="stat-card">
    <span class="stat-number" data-target="8">0</span>
    <span class="stat-label">Classes Taught</span>
  </div>
</div>

<div class="lessons-info">
  <h2>In-Person &amp; Online Lessons</h2>
  <p>I offer chess lessons for students of all skill levels — whether you're a complete beginner just learning how the pieces move, or an intermediate player ready to take your game to the next level.</p>
  <p>Lessons are available both <strong>in person</strong> and <strong>online</strong>, and can be tailored to your schedule and goals.</p>
  <p>For availability, scheduling, and pricing, please <a href="/contact/">contact me</a> — I'd love to hear from you.</p>
</div>

<script>
document.querySelectorAll('.stat-number').forEach(function(el) {
  var target = parseInt(el.getAttribute('data-target'), 10);
  var duration = 1400;
  var start = null;
  function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
  function step(ts) {
    if (!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    el.textContent = Math.floor(ease(progress) * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
});
</script>
