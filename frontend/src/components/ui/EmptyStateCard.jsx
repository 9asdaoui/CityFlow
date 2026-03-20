const EmptyStateCard = ({ title, description }) => {
  return (
    <section className="glass rounded-2xl border border-control-border p-8">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-200">{description}</p>
    </section>
  );
};

export default EmptyStateCard;
